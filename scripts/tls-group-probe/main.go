// Copyright Contributors to the Open Cluster Management project

// tls-group-probe makes one fresh TLS handshake with one offered group.
package main

import (
	"crypto/tls"
	"flag"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

func main() {
	address := flag.String("address", "", "local port-forward address")
	version := flag.String("version", "", "TLS version: 12 or 13")
	group := flag.String("group", "", "group: p256, p384, x25519, or x25519mlkem768")
	expect := flag.String("expect", "allow", "expected handshake result: allow or reject")
	flag.Parse()

	groups := map[string]tls.CurveID{
		"p256":           tls.CurveP256,
		"p384":           tls.CurveP384,
		"x25519":         tls.X25519,
		"x25519mlkem768": tls.X25519MLKEM768,
	}
	curve, ok := groups[*group]
	if !ok || *address == "" || (*expect != "allow" && *expect != "reject") {
		flag.Usage()
		os.Exit(2)
	}
	var tlsVersion uint16
	switch *version {
	case "12":
		tlsVersion = tls.VersionTLS12
	case "13":
		tlsVersion = tls.VersionTLS13
	default:
		flag.Usage()
		os.Exit(2)
	}

	// Certificate verification is outside this probe's group-policy contract.
	client := &http.Client{
		Timeout: 8 * time.Second,
		Transport: &http.Transport{TLSClientConfig: &tls.Config{
			InsecureSkipVerify: true, // The same endpoint and certificate are used for positive and negative controls.
			MinVersion:         tlsVersion,
			MaxVersion:         tlsVersion,
			CurvePreferences:   []tls.CurveID{curve},
		}},
	}
	response, err := client.Get("https://" + *address + "/plugin/plugin-manifest.json")
	if err == nil {
		defer response.Body.Close()
	}

	if *expect == "reject" {
		if err != nil && strings.Contains(err.Error(), "remote error: tls: handshake failure") {
			fmt.Printf("PASS TLS%s %s rejected: %v\n", *version, *group, err)
			return
		}
		fmt.Fprintf(os.Stderr, "FAIL TLS%s %s: expected TLS handshake rejection, got status=%v error=%v\n", *version, *group, status(response), err)
		os.Exit(1)
	}
	if err != nil || response.StatusCode != http.StatusOK || response.TLS == nil || response.TLS.Version != tlsVersion {
		fmt.Fprintf(os.Stderr, "FAIL TLS%s %s: status=%v error=%v\n", *version, *group, status(response), err)
		os.Exit(1)
	}
	fmt.Printf("PASS TLS%s %s accepted: HTTP %d, %s\n", *version, *group, response.StatusCode, tls.CipherSuiteName(response.TLS.CipherSuite))
}

func status(response *http.Response) string {
	if response == nil {
		return "none"
	}
	return response.Status
}
