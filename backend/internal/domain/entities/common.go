package entities

import (
	"regexp"
	"strings"
)

var slugRegex = regexp.MustCompile(`[^a-z0-9\-]`)

func generateSlug(name string) string {
	slug := strings.ToLower(name)
	slug = strings.ReplaceAll(slug, " ", "-")
	slug = slugRegex.ReplaceAllString(slug, "")
	slug = strings.Trim(slug, "-")
	
	if len(slug) > 100 {
		slug = slug[:100]
	}
	
	return slug
}

type Pagination struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
	HasNext    bool  `json:"has_next"`
	HasPrev    bool  `json:"has_prev"`
}

func NewPagination(page, limit int, total int64) *Pagination {
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	totalPages := int((total + int64(limit) - 1) / int64(limit))
	
	return &Pagination{
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1,
	}
}

func (p *Pagination) Offset() int {
	return (p.Page - 1) * p.Limit
}