// file from https://github.com/uber/athenadriver/blob/9cdfbec4b56d185aba222ba4ae24739fa0986674/go/datetime.go
package driver

import (
	"fmt"
	"strings"
	"time"
	"unicode"
)

// AthenaTime represents a time.Time value that can be null.
// The AthenaTime supports Athena's Date, Time and Timestamp data types,
// with or without time zone.
type AthenaTime struct {
	Time  time.Time
	Valid bool
}

var timeLayouts = []string{
	"2006-01-02",
	"15:04:05.000",
	"2006-01-02 15:04:05.000",
}

func scanTime(vv string) (AthenaTime, error) {
	parts := strings.Split(vv, " ")
	if len(parts) > 1 && !unicode.IsDigit(rune(parts[len(parts)-1][0])) {
		return parseAthenaTimeWithLocation(vv)
	}
	return parseAthenaTime(vv)
}

func parseAthenaTime(v string) (AthenaTime, error) {
	var t time.Time
	var err error
	for _, layout := range timeLayouts {
		t, err = time.ParseInLocation(layout, v, time.Local)
		if err == nil {
			return AthenaTime{Valid: true, Time: t}, nil
		}
	}
	return AthenaTime{}, err
}

func parseAthenaTimeWithLocation(v string) (AthenaTime, error) {
	idx := strings.LastIndex(v, " ")
	if idx == -1 {
		return AthenaTime{}, fmt.Errorf("cannot convert %v (%T) to time+zone", v, v)
	}
	stamp, location := v[:idx], v[idx+1:]
	loc, err := time.LoadLocation(location)
	if err != nil {
		return AthenaTime{}, fmt.Errorf("cannot load timezone %q: %v", location, err)
	}
	var t time.Time
	for _, layout := range timeLayouts {
		t, err = time.ParseInLocation(layout, stamp, loc)
		if err == nil {
			return AthenaTime{Valid: true, Time: t}, nil
		}
	}
	return AthenaTime{}, err
}
