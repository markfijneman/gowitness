package lib

import (
	"math"

	"gorm.io/gorm"
)

// PaginationPage is a sinlge, paginated page
type PaginationPage struct {
	Count         int64
	Pages         int
	Records       interface{}
	Offset        int
	Range         int
	Limit         int
	Page          int
	PrevPage      int
	PrevPageRange []int
	NextPage      int
	NextPageRange []int
}

// Pagination has options for a Page
type Pagination struct {
	DB             *gorm.DB
	CurrPage       int
	Limit          int
	OrderBy        []string
	Query          string
	Tag            string
	HideDuplicates bool
}

// Page pages a dataset
func (p *Pagination) Page(data interface{}) (*PaginationPage, error) {
	var pagination PaginationPage
	var count int64
	var offset int

	db := p.DB

	if p.CurrPage < 1 {
		p.CurrPage = 1
	}
	if p.Limit == 0 {
		p.Limit = 60
	}
	if len(p.OrderBy) > 0 {
		for _, order := range p.OrderBy {
			db = db.Order(order)
		}
	}

	// Build query
	query := db.Preload("Technologies").Preload("Headers")

	if p.HideDuplicates {
		// Remove duplicate final URLs
		// Trim away / so http to https redirects also get filtered out, as those commonly redirect from http://example.com to https://example.com/
		query = query.Group("trim(final_url, '/')")
	}

	// Add filters to the query for search terms if provided
	if p.Query != "" {
		search := "%" + p.Query + "%"

		query = query.Where(
			db.
				Where("URL LIKE ?", search).
				Or("Title LIKE ?", search).
				Or("DOM LIKE ?", search),
		)
	}

	// Add filters to the query for tag if provided
	if p.Tag != "" {
		search := p.Tag

		query = query.
			Where("Tag LIKE ?", search)
	}

	// Get size of results
	query.Model(data).Count(&count)

	// Compute offset
	if p.CurrPage == 1 {
		offset = 0
	} else {
		offset = (p.CurrPage - 1) * p.Limit
	}

	// Run query, do not load dom since that slows down performance a lot
	if err := query.Select("id, url, final_url, response_code, title, filename, is_pdf, perception_hash, screenshot, meta_generator, tag, visited").Limit(p.Limit).Offset(offset).Preload("Technologies").Preload("Headers").Find(data).Error; err != nil {
		return nil, err
	}

	pagination.Count = count
	pagination.Records = data
	pagination.Page = p.CurrPage

	pagination.Offset = offset
	pagination.Limit = p.Limit
	pagination.Pages = int(math.Ceil(float64(count) / float64(p.Limit)))
	pagination.Range = pagination.Offset + pagination.Limit

	if p.CurrPage > 1 {
		pagination.PrevPage = p.CurrPage - 1
	} else {
		pagination.PrevPage = p.CurrPage
	}

	if p.CurrPage >= pagination.Pages {
		pagination.NextPage = p.CurrPage
	} else {
		pagination.NextPage = p.CurrPage + 1
	}

	pagination.PrevPageRange = makeSizedRange(1, pagination.PrevPage, 5)

	// ceil if we are in front
	if pagination.Page == 1 {
		pagination.PrevPageRange = []int{}
	}

	// wrap if we reach the end
	if pagination.Page == pagination.Pages {
		pagination.NextPage = 1
		pagination.NextPageRange = []int{}
	} else {
		pagination.NextPageRange = makeSizedRange(pagination.NextPage, pagination.Pages, 5)
	}

	return &pagination, nil
}

func makeSizedRange(min, max, l int) []int {
	if min > max {
		return []int{}
	}

	a := make([]int, max-min+1)
	for i := range a {
		a[i] = min + i
	}

	return a
}
