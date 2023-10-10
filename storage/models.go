package storage

import (
	"encoding/json"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
	"gorm.io/gorm"
)

// URL contains information about a URL
type URL struct {
	gorm.Model

	URL            string
	FinalURL       string
	ResponseCode   int
	ResponseReason string
	Proto          string
	ContentLength  int64
	Title          string
	Filename       string
	IsPDF          bool
	PerceptionHash string
	DOM            string
	Screenshot     string
	Tag            string
	Visited        bool

	TLS TLS

	Headers      []Header
	Technologies []Technologie
	Console      []ConsoleLog
	Network      []NetworkLog
}

// AddHeader adds a new header to a URL
func (url *URL) AddHeader(key string, value string) {
	url.Headers = append(url.Headers, Header{
		Key:   key,
		Value: value,
	})
}

// GetHeader gets a header from a URL
func (url *URL) GetHeader(key string) string {
	for _, header := range url.Headers {
		if header.Key == key {
			return header.Value
		}
	}
	return ""
}

// AddTechnlogies adds a new technologies to a URL
func (url *URL) AddTechnologie(value string) {
	url.Technologies = append(url.Technologies, Technologie{
		Value: value,
	})
}

// GetMetaTag tries to find the meta tag with the supplied name and returns the value
func (url *URL) GetMetaTag(name string) string {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(url.DOM))
	if err != nil {
		return "ERROR!"
	}

	value, _ := doc.Find("meta[name='" + name + "' i]").Attr("content")
	return value
}

// MarshallCSV returns values as a slice
func (url *URL) MarshallCSV() (res []string) {
	return []string{url.URL,
		url.FinalURL,
		strconv.Itoa(url.ResponseCode),
		url.ResponseReason,
		url.Proto,
		strconv.Itoa(int(url.ContentLength)),
		url.Title,
		url.Filename}
}

// MarshallJSON returns values as a slice
func (url *URL) MarshallJSON() ([]byte, error) {
	var tmp struct {
		URL            string `json:"url"`
		FinalURL       string `json:"final_url"`
		ResponseCode   int    `json:"response_code"`
		ResponseReason string `json:"response_reason"`
		Proto          string `json:"proto"`
		ContentLength  int64  `json:"content_length"`
		Title          string `json:"title"`
		Filename       string `json:"file_name"`
	}

	tmp.URL = url.URL
	tmp.FinalURL = url.FinalURL
	tmp.ResponseCode = url.ResponseCode
	tmp.ResponseReason = url.ResponseReason
	tmp.Proto = url.Proto
	tmp.ContentLength = url.ContentLength
	tmp.Title = url.Title
	tmp.Filename = url.Filename

	return json.Marshal(&tmp)
}

// Header contains an HTTP header
type Header struct {
	gorm.Model

	URLID uint

	Key   string
	Value string
}

// Technologie contains a technologie
type Technologie struct {
	gorm.Model

	URLID uint

	Value string
}

// TLS contains TLS information for a URL
type TLS struct {
	gorm.Model

	URLID uint

	Version         uint16
	ServerName      string
	TLSCertificates []TLSCertificate
}

// TLSCertificate contain TLS Certificate information
type TLSCertificate struct {
	gorm.Model

	TLSID uint

	Raw                []byte
	DNSNames           []TLSCertificateDNSName
	SubjectCommonName  string
	IssuerCommonName   string
	SignatureAlgorithm string
	PubkeyAlgorithm    string
}

// AddDNSName adds a new DNS Name to a Certificate
func (tlsCert *TLSCertificate) AddDNSName(name string) {
	tlsCert.DNSNames = append(tlsCert.DNSNames, TLSCertificateDNSName{Name: name})
}

// TLSCertificateDNSName has DNS names for a TLS certificate
type TLSCertificateDNSName struct {
	gorm.Model

	TLSCertificateID uint
	Name             string
}

// ConsoleLog contains the console log, and exceptions emitted
type ConsoleLog struct {
	gorm.Model

	URLID uint

	Time  time.Time
	Type  string
	Value string
}

// RequestType are network log types
type RequestType int

const (
	HTTP RequestType = 0
	WS
)

// NetworkLog contains Chrome networks events that were emitted
type NetworkLog struct {
	gorm.Model

	URLID uint

	RequestID   string
	RequestType RequestType
	StatusCode  int64
	URL         string
	FinalURL    string
	IP          string
	Time        time.Time
	Error       string
}
