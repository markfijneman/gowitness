package driver

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/chromedp/cdproto/network"
	"github.com/chromedp/cdproto/page"
	"github.com/chromedp/cdproto/runtime"
	"github.com/chromedp/chromedp"
	"github.com/corona10/goimagehash"
	"github.com/sensepost/gowitness/internal/islazy"
	"github.com/sensepost/gowitness/pkg/log"
	"github.com/sensepost/gowitness/pkg/models"
	"github.com/sensepost/gowitness/pkg/runner"
)

// Chromedp is a driver that probes web targets using chromedp
// Implementation ref: https://github.com/chromedp/examples/blob/master/multi/main.go
type Chromedp struct {
	// browser context for chromedp
	browserctx    context.Context
	browserCancel context.CancelFunc
	// options for the Runner to consider
	options runner.Options
}

func NewChromedp(opts runner.Options) (*Chromedp, error) {
	var ctx context.Context

	if opts.Chrome.WSS == "" {
		// set up chrome context and launch options
		allocOpts := append(chromedp.DefaultExecAllocatorOptions[:],
			chromedp.IgnoreCertErrors,
			chromedp.UserAgent(opts.Chrome.UserAgent),
			chromedp.Flag("disable-features", "MediaRouter"),
			chromedp.Flag("mute-audio", true),
			chromedp.Flag("disable-background-timer-throttling", true),
			chromedp.Flag("disable-backgrounding-occluded-windows", true),
			chromedp.Flag("disable-renderer-backgrounding", true),
			chromedp.Flag("deny-permission-prompts", true),
			chromedp.WindowSize(opts.Chrome.WindowX, opts.Chrome.WindowY),
		)

		// Set proxy if specified
		if opts.Chrome.Proxy != "" {
			allocOpts = append(allocOpts, chromedp.ProxyServer(opts.Chrome.Proxy))
		}

		// Use specific Chrome binary if provided
		if opts.Chrome.Path != "" {
			allocOpts = append(allocOpts, chromedp.ExecPath(opts.Chrome.Path))
		}

		ctx, _ = chromedp.NewExecAllocator(context.Background(), allocOpts...)

	} else {
		ctx, _ = chromedp.NewRemoteAllocator(context.Background(), opts.Chrome.WSS)
		log.Debug("using a user specified WSS url", "control-url", opts.Chrome.WSS)
	}

	browserCtx, cancel := chromedp.NewContext(ctx)
	log.Debug("got a browser context")

	return &Chromedp{
		browserctx:    browserCtx,
		browserCancel: cancel,
		options:       opts,
	}, nil
}

// witness does the work of probing a url.
// This is where everything comes together as far as the runner is concerned.
func (run *Chromedp) Witness(target string, runner *runner.Runner) (*models.Result, error) {
	logger := log.With("target", target)
	logger.Debug("witnessing 👀")

	// get a tab
	tabCtx, tabCancel := chromedp.NewContext(run.browserctx)
	defer tabCancel()

	// get a timeout context for navigation
	navigationCtx, navigationCancel := context.WithTimeout(tabCtx, time.Duration(run.options.Scan.Timeout)*time.Second)
	defer navigationCancel()

	if err := chromedp.Run(navigationCtx, network.Enable()); err != nil {
		return nil, fmt.Errorf("error enabling network tracking: %w", err)
	}

	// set extra headers, if any
	if len(run.options.Chrome.Headers) > 0 {
		headers := make(network.Headers)
		for _, header := range run.options.Chrome.Headers {
			kv := strings.SplitN(header, ":", 2)
			if len(kv) != 2 {
				logger.Warn("custom header did not parse correctly", "header", header)
				continue
			}

			headers[kv[0]] = kv[1]

			if err := chromedp.Run(navigationCtx, network.SetExtraHTTPHeaders((headers))); err != nil {
				return nil, fmt.Errorf("could not set extra http headers: %w", err)
			}
		}
	}

	// use page events to grab information about targets. It's how we
	// know what the results of the first request is to save as an overall
	// url result for output writers.
	var (
		result = &models.Result{
			URL:      target,
			ProbedAt: time.Now(),
		}
		resultMutex sync.Mutex
		first       *network.EventRequestWillBeSent
		netlog      = make(map[string]models.NetworkLog)
	)

	go chromedp.ListenTarget(navigationCtx, func(ev interface{}) {
		switch e := ev.(type) {
		// dismiss any javascript dialogs
		case *page.EventJavascriptDialogOpening:
			if err := chromedp.Run(navigationCtx, page.HandleJavaScriptDialog(true)); err != nil {
				logger.Error("failed to handle a javascript dialog", "err", err)
			}
		// log console.* calls
		case *runtime.EventConsoleAPICalled:
			v := ""
			for _, arg := range e.Args {
				v += string(arg.Value)
			}

			if v == "" {
				return
			}

			resultMutex.Lock()
			result.Console = append(result.Console, models.ConsoleLog{
				Type:  "console." + string(e.Type),
				Value: strings.TrimSpace(v),
			})
			resultMutex.Unlock()

		// network related events
		// write a request to the network request map
		case *network.EventRequestWillBeSent:
			if first == nil {
				first = e
			}
			netlog[string(e.RequestID)] = models.NetworkLog{
				Time:        e.WallTime.Time(),
				RequestType: models.HTTP,
				URL:         e.Request.URL,
			}
		case *network.EventResponseReceived:
			if entry, ok := netlog[string(e.RequestID)]; ok {
				if first != nil && first.RequestID == e.RequestID {
					resultMutex.Lock()
					result.FinalURL = e.Response.URL
					result.ResponseCode = int(e.Response.Status)
					result.ResponseReason = e.Response.StatusText
					result.Protocol = e.Response.Protocol
					result.ContentLength = int64(e.Response.EncodedDataLength)

					// write headers
					for k, v := range e.Response.Headers {
						result.Headers = append(result.Headers, models.Header{
							Key:   k,
							Value: v.(string),
						})
					}

					// grab security detail if available
					if e.Response.SecurityDetails != nil {
						var sanlist []models.TLSSanList
						for _, san := range e.Response.SecurityDetails.SanList {
							sanlist = append(sanlist, models.TLSSanList{
								Value: san,
							})
						}

						result.TLS = models.TLS{
							Protocol:                 e.Response.SecurityDetails.Protocol,
							KeyExchange:              e.Response.SecurityDetails.KeyExchange,
							Cipher:                   e.Response.SecurityDetails.Cipher,
							SubjectName:              e.Response.SecurityDetails.SubjectName,
							SanList:                  sanlist,
							Issuer:                   e.Response.SecurityDetails.Issuer,
							ValidFrom:                float64(e.Response.SecurityDetails.ValidFrom.Time().UnixMilli()),
							ValidTo:                  float64(e.Response.SecurityDetails.ValidTo.Time().UnixMilli()),
							ServerSignatureAlgorithm: e.Response.SecurityDetails.ServerSignatureAlgorithm,
							EncryptedClientHello:     e.Response.SecurityDetails.EncryptedClientHello,
						}
					}
					resultMutex.Unlock()
				}

				entry.StatusCode = e.Response.Status
				entry.URL = e.Response.URL
				entry.RemoteIP = e.Response.RemoteIPAddress
				entry.MIMEType = e.Response.MimeType
				if e.Response.ResponseTime != nil {
					entry.Time = e.Response.ResponseTime.Time()
				}

				// write the network log
				resultMutex.Lock()
				result.Network = append(result.Network, entry)
				resultMutex.Unlock()

			}
		// mark a request as failed
		case *network.EventLoadingFailed:
			// grab an existing requestid an add failure info
			if entry, ok := netlog[string(e.RequestID)]; ok {
				resultMutex.Lock()

				// update the first request details
				if first != nil && first.RequestID == e.RequestID {
					result.Failed = true
					result.FailedReason = e.ErrorText
				} else {
					entry.Error = e.ErrorText

					// write the network log
					result.Network = append(result.Network, entry)
				}

				resultMutex.Unlock()
			}
		}

		// TODO: wss
	})

	// navigate to the target
	if err := chromedp.Run(
		navigationCtx, chromedp.Navigate(target),
	); err != nil && err != context.DeadlineExceeded {
		return nil, fmt.Errorf("could not navigate to target: %w", err)
	}

	// just wait if there is a delay
	if run.options.Scan.Delay > 0 {
		time.Sleep(time.Duration(run.options.Scan.Delay) * time.Second)
	}

	// run any javascript we have
	if run.options.Scan.JavaScript != "" {
		if err := chromedp.Run(navigationCtx, chromedp.Evaluate(run.options.Scan.JavaScript, nil)); err != nil {
			logger.Error("failed to evaluate user-provided javascript", "err", err)
		}
	}

	// grab the title
	if err := chromedp.Run(navigationCtx, chromedp.Title(&result.Title)); err != nil {
		logger.Error("could not get page title", "err", err)
	}

	// get html
	if err := chromedp.Run(navigationCtx, chromedp.OuterHTML(":root", &result.HTML, chromedp.ByQueryAll)); err != nil {
		logger.Error("could not get page html", "err", err)
	}

	// fingerprint technologies in the first response
	if fingerprints := runner.Wappalyzer.Fingerprint(result.HeaderMap(), []byte(result.HTML)); fingerprints != nil {
		for tech := range fingerprints {
			result.Technologies = append(result.Technologies, models.Technology{
				Value: tech,
			})
		}
	}

	// grab a screenshot
	var img []byte
	err := chromedp.Run(navigationCtx,
		chromedp.ActionFunc(func(ctx context.Context) error {
			var err error
			img, err = page.CaptureScreenshot().
				WithQuality(80).
				WithFormat(page.CaptureScreenshotFormat(run.options.Scan.ScreenshotFormat)).
				Do(ctx)
			return err
		}),
	)

	if err != nil {
		if run.options.Logging.LogScanErrors {
			logger.Error("could not grab screenshot", "err", err)
		}

		result.Failed = true
		result.FailedReason = err.Error()
	} else {
		// write the screenshot to disk
		result.Filename = islazy.SafeFileName(target) + "." + run.options.Scan.ScreenshotFormat
		if err := os.WriteFile(
			filepath.Join(run.options.Scan.ScreenshotPath, result.Filename),
			img, 0o664,
		); err != nil {
			return nil, fmt.Errorf("could not write screenshot to disk: %w", err)
		}

		// calculate and set the perception hash
		decoded, _, err := image.Decode(bytes.NewReader(img))
		if err != nil {
			return nil, fmt.Errorf("failed to decode screenshot image: %w", err)
		}

		hash, err := goimagehash.PerceptionHash(decoded)
		if err != nil {
			return nil, fmt.Errorf("failed to calculate image perception hash: %w", err)
		}
		result.PerceptionHash = hash.ToString()
	}

	return result, nil
}

func (run *Chromedp) Close() {
	run.browserCancel()
}
