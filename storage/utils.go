package storage

import (
	"strconv"
	"strings"

	"github.com/PuerkitoBio/goquery"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
)

// Generates values for columns added by this fork, if not present already
func GenerateMissingValues(db *gorm.DB) {
	// Generate missing meta_generator values
	var count int64
	db.Model(&URL{}).Where("meta_generator IS NULL").Count(&count)
	if count > 0 {
		log.Info().Str("field", "meta_generator").Msg("generating " + strconv.FormatInt(count, 10) + " database values")

		// Select IDs where meta_generator is null
		var urls []URL
		db.Select("id").Where("meta_generator IS NULL").Find(&urls)

		// Convert to array
		var ids []uint
		for _, element := range urls {
			ids = append(ids, element.ID)
		}

		// Update entries one-by-one, based on ID
		// Prevents out of memory crash
		for _, id := range ids {
			var url URL
			db.First(&url, id)

			url.MetaGenerator = GetMetaTag(url.DOM, "generator")
			db.Save(url)
		}
	}
}

// GetMetaTag tries to find the meta tag with the supplied name and returns the value
func GetMetaTag(DOM string, name string) string {
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(DOM))
	if err != nil {
		return "ERROR!"
	}

	value, _ := doc.Find("meta[name='" + name + "' i]").Attr("content")
	return value
}
