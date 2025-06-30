package entities

import "time"

// DashboardStats represents the overall statistics for the dashboard
type DashboardStats struct {
	TotalCategories      int     `json:"total_categories"`
	TotalSubCategories   int     `json:"total_sub_categories"`
	TotalItems           int     `json:"total_items"`
	AvailableItems       int     `json:"available_items"`
	UnavailableItems     int     `json:"unavailable_items"`
	AveragePrice         float64 `json:"average_price"`
	RecentItemsCount     int     `json:"recent_items_count"`
	RecentCategoriesCount int    `json:"recent_categories_count"`
}

// ActivityType represents the type of activity in the system
type ActivityType string

const (
	ActivityTypeItem        ActivityType = "item"
	ActivityTypeCategory    ActivityType = "category"
	ActivityTypeSubCategory ActivityType = "subcategory"
)

// ActionType represents the action performed
type ActionType string

const (
	ActionTypeCreated ActionType = "created"
	ActionTypeUpdated ActionType = "updated"
	ActionTypeDeleted ActionType = "deleted"
)

// RecentActivity represents recent activities in the system
type RecentActivity struct {
	ID        uint         `json:"id"`
	Type      ActivityType `json:"type"`
	Name      string       `json:"name"`
	Action    ActionType   `json:"action"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
}

// CategoryStats represents statistics for a specific category
type CategoryStats struct {
	ID             uint    `json:"id"`
	Name           string  `json:"name"`
	ItemCount      int     `json:"item_count"`
	AvailableItems int     `json:"available_items"`
	AveragePrice   float64 `json:"average_price"`
	TotalRevenue   float64 `json:"total_revenue,omitempty"` // For future use
}

// PriceRange represents a price range for distribution analysis
type PriceRange struct {
	Min   float64 `json:"min"`
	Max   float64 `json:"max"`
	Label string  `json:"label"`
}

// PriceDistribution represents the distribution of items by price range
type PriceDistribution struct {
	Range      string  `json:"range"`
	Count      int     `json:"count"`
	Percentage float64 `json:"percentage"`
}

// WeeklyItemsData represents items added per day over a week
type WeeklyItemsData struct {
	Date  time.Time `json:"date"`
	Day   string    `json:"day"`
	Count int       `json:"count"`
}

// DashboardFilter represents filtering options for dashboard data
type DashboardFilter struct {
	DateFrom   *time.Time `json:"date_from,omitempty"`
	DateTo     *time.Time `json:"date_to,omitempty"`
	CategoryID *uint      `json:"category_id,omitempty"`
	Active     *bool      `json:"active,omitempty"`
	Days       int        `json:"days,omitempty"` // Number of days to look back (default: 7)
}

// AvailabilityStats represents availability statistics
type AvailabilityStats struct {
	TotalItems      int     `json:"total_items"`
	AvailableItems  int     `json:"available_items"`
	UnavailableItems int    `json:"unavailable_items"`
	AvailabilityRate float64 `json:"availability_rate"` // Percentage
}

// MenuHealthMetrics represents the overall health of the menu
type MenuHealthMetrics struct {
	CategoriesWithoutItems    int                `json:"categories_without_items"`
	SubCategoriesWithoutItems int                `json:"subcategories_without_items"`
	ItemsWithoutImages        int                `json:"items_without_images"`
	ItemsWithoutDescription   int                `json:"items_without_description"`
	AvailabilityStats         AvailabilityStats  `json:"availability_stats"`
	PriceRangeStats           []PriceDistribution `json:"price_range_stats"`
}

// DashboardResponse represents the complete dashboard data response
type DashboardResponse struct {
	Stats            DashboardStats      `json:"stats"`
	RecentActivity   []RecentActivity    `json:"recent_activity"`
	CategoryStats    []CategoryStats     `json:"category_stats"`
	PriceDistribution []PriceDistribution `json:"price_distribution"`
	WeeklyData       []WeeklyItemsData   `json:"weekly_data"`
	MenuHealth       MenuHealthMetrics   `json:"menu_health"`
}