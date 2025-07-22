package seeds

import (
	"context"
	"time"

	"restaurant-menu-api/internal/domain/entities"
	"gorm.io/gorm"
)

// seedRestaurantInfo creates the main restaurant information
func (s *Seeder) seedRestaurantInfo(ctx context.Context, db *gorm.DB) error {
	restaurantInfo := &entities.RestaurantInfo{
		Name: "Olive Grove Mediterranean",
		Description: "Experience the authentic flavors of the Mediterranean at Olive Grove, where traditional recipes meet modern culinary artistry. Located in the heart of Dubai Marina, we offer a warm, inviting atmosphere perfect for family dinners, romantic dates, and business gatherings.",
		Address: entities.Address{
			"street":      "Marina Walk, Building 23",
			"area":        "Dubai Marina", 
			"city":        "Dubai",
			"country":     "United Arab Emirates",
			"postal_code": "12345",
			"latitude":    25.0657,
			"longitude":   55.1713,
			"landmarks":   "Near JBR Beach, opposite Marina Mall",
		},
		ContactInfo: entities.ContactInfo{
			"phone":        "+971-4-123-4567",
			"mobile":       "+971-50-123-4567", 
			"email":        "info@olivegroverestaurant.ae",
			"website":      "https://www.olivegroverestaurant.ae",
			"instagram":    "@olivegroverestarurant",
			"facebook":     "OliveGroveRestaurantDubai",
			"whatsapp":     "+971-50-123-4567",
			"reservation":  "+971-4-123-4567",
		},
		Settings: entities.Settings{
			"currency":              "AED",
			"tax_rate":              0.05,
			"service_charge_rate":   0.10,
			"accepts_reservations":  true,
			"delivery_available":    true,
			"takeaway_available":    true,
			"parking_available":     true,
			"wifi_available":        true,
			"kid_friendly":          true,
			"outdoor_seating":       true,
			"private_dining":        true,
			"dress_code":            "Smart casual",
			"payment_methods":       []string{"Cash", "Credit Card", "Debit Card", "Apple Pay", "Samsung Pay"},
			"languages":             []string{"English", "Arabic", "Hindi", "Urdu"},
			"capacity":              120,
			"established_year":      2018,
		},
		Active: true,
	}

	// Check if restaurant already exists
	var existing entities.RestaurantInfo
	if err := db.Where("name = ?", restaurantInfo.Name).First(&existing).Error; err == nil {
		s.logger.Info("Restaurant info already exists, skipping...")
		return nil
	}

	if err := db.Create(restaurantInfo).Error; err != nil {
		return err
	}

	s.logger.WithField("restaurant", restaurantInfo.Name).Info("Restaurant info seeded successfully")
	return nil
}

// seedOperatingHours creates the weekly operating hours
func (s *Seeder) seedOperatingHours(ctx context.Context, db *gorm.DB) error {
	// Get restaurant ID
	var restaurant entities.RestaurantInfo
	if err := db.Where("name = ?", "Olive Grove Mediterranean").First(&restaurant).Error; err != nil {
		return err
	}

	// Check if operating hours already exist
	var existingCount int64
	if err := db.Model(&entities.OperatingHour{}).Where("restaurant_info_id = ?", restaurant.ID).Count(&existingCount).Error; err == nil && existingCount > 0 {
		s.logger.Info("Operating hours already exist, skipping...")
		return nil
	}

	// Define operating hours (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
	operatingHours := []entities.OperatingHour{
		// Sunday
		{
			DayOfWeek:        0,
			OpenTime:         timePtr("11:00:00"),
			CloseTime:        timePtr("23:00:00"),
			IsClosed:         false,
			RestaurantInfoID: restaurant.ID,
		},
		// Monday
		{
			DayOfWeek:        1,
			OpenTime:         timePtr("11:00:00"),
			CloseTime:        timePtr("23:00:00"),
			IsClosed:         false,
			RestaurantInfoID: restaurant.ID,
		},
		// Tuesday
		{
			DayOfWeek:        2,
			OpenTime:         timePtr("11:00:00"),
			CloseTime:        timePtr("23:00:00"),
			IsClosed:         false,
			RestaurantInfoID: restaurant.ID,
		},
		// Wednesday
		{
			DayOfWeek:        3,
			OpenTime:         timePtr("11:00:00"),
			CloseTime:        timePtr("23:00:00"),
			IsClosed:         false,
			RestaurantInfoID: restaurant.ID,
		},
		// Thursday
		{
			DayOfWeek:        4,
			OpenTime:         timePtr("11:00:00"),
			CloseTime:        timePtr("23:30:00"),
			IsClosed:         false,
			RestaurantInfoID: restaurant.ID,
		},
		// Friday
		{
			DayOfWeek:        5,
			OpenTime:         timePtr("11:00:00"),
			CloseTime:        timePtr("23:30:00"),
			IsClosed:         false,
			RestaurantInfoID: restaurant.ID,
		},
		// Saturday  
		{
			DayOfWeek:        6,
			OpenTime:         timePtr("11:00:00"),
			CloseTime:        timePtr("23:30:00"),
			IsClosed:         false,
			RestaurantInfoID: restaurant.ID,
		},
	}

	for _, hours := range operatingHours {
		if err := db.Create(&hours).Error; err != nil {
			return err
		}
	}

	s.logger.Info("Operating hours seeded successfully")
	return nil
}

// Helper function to create time string pointer  
func timePtr(timeStr string) *string {
	// For PostgreSQL TIME columns, just return the time in HH:MM:SS format
	t, err := time.Parse("15:04:05", timeStr)
	if err != nil {
		return nil // return nil for invalid time
	}
	
	// Format as simple time string for TIME columns
	timeString := t.Format("15:04:05")
	return &timeString
}