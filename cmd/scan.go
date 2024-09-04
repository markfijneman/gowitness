package cmd

import (
	"github.com/sensepost/gowitness/pkg/writers"
	"github.com/spf13/cobra"
)

var (
	scanWriters = []writers.Writer{}
)

// scanCmd represents the scan command
var scanCmd = &cobra.Command{
	Use:   "scan",
	Short: "Perform various scans",
	PersistentPreRunE: func(cmd *cobra.Command, args []string) error {
		// annoying quirk, but because im overriding persistentprerun
		// here which overrides the parent it seems.
		// so we need to explicitly call the parents one now.
		if err := rootCmd.PersistentPreRunE(cmd, args); err != nil {
			return err
		}

		// configure writers that subdommand scanners will pass to
		// a runner instance.
		if opts.Output.Jsonl {
			w, err := writers.NewJsonWriter(opts.Output.JsonlFile)
			if err != nil {
				return err
			}
			scanWriters = append(scanWriters, w)
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(scanCmd)

	// logging control for sub commands
	scanCmd.PersistentFlags().BoolVarP(&opts.Logging.LogScanErrors, "log-scan-errors", "", false, "Log scan errors (timeouts, dns errors, etc.) to stderr")

	// "threads" && other
	scanCmd.PersistentFlags().IntVarP(&opts.Scan.Threads, "threads", "t", 6, "Number of concurrent threads (goroutines) to use")
	scanCmd.PersistentFlags().IntVarP(&opts.Scan.Timeout, "timeout", "T", 30, "Number of seconds before considering a page timed out")
	scanCmd.PersistentFlags().StringArrayVarP(&opts.Scan.UriFilter, "uri-filter", "", []string{"http", "https"}, "Valid URI's to pass to the scanning process")
	scanCmd.PersistentFlags().StringVarP(&opts.Scan.ScreenshotPath, "screenshot-path", "s", "./screenshots", "Path to store screenshots")
	scanCmd.PersistentFlags().StringVarP(&opts.Scan.UserAgent, "user-agent", "", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36", "The user-agent string to use")

	// output controlling for scan sub commands
	scanCmd.PersistentFlags().BoolVarP(&opts.Output.Db, "write-db", "", false, "Write results to a Sqlite database")
	scanCmd.PersistentFlags().StringVarP(&opts.Output.DbFile, "write-db-file", "", "gowitness.sqlite3", "The file to write the Sqlite database to")
	scanCmd.PersistentFlags().BoolVarP(&opts.Output.Csv, "write-csv", "", false, "Write results as CSV (has limited columns)")
	scanCmd.PersistentFlags().StringVarP(&opts.Output.CsvFile, "write-csv-file", "", "gowitness.csv", "The file to write CSV rows to")
	scanCmd.PersistentFlags().BoolVarP(&opts.Output.Jsonl, "write-jsonl", "", false, "Write results as JSON lines")
	scanCmd.PersistentFlags().StringVarP(&opts.Output.JsonlFile, "write-jsonl-file", "", "gowitness.jsonl", "The file to write JSON lines to")
}
