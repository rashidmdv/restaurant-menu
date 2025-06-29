package migrations

import (
	"restaurant-menu-api/internal/domain/entities"
	"gorm.io/gorm"
)

func SeedData(db *gorm.DB) error {
	// Create sample restaurant info
	restaurantInfo := &entities.RestaurantInfo{
		Name:        "Sample Restaurant",
		Description: "A fine dining experience with authentic cuisine",
		Address: entities.Address{
			"street":  "123 Main Street",
			"city":    "Dubai",
			"state":   "Dubai",
			"country": "UAE",
			"zipcode": "12345",
		},
		ContactInfo: entities.ContactInfo{
			"phone":   "+971-50-123-4567",
			"email":   "info@samplerestaurant.com",
			"website": "https://samplerestaurant.com",
			"social": map[string]string{
				"facebook":  "@samplerestaurant",
				"instagram": "@samplerestaurant",
				"twitter":   "@samplerestaurant",
			},
		},
		Settings: entities.Settings{
			"currency":     "AED",
			"tax_rate":     5.0,
			"service_fee":  10.0,
			"theme_color":  "#FF6B6B",
		},
	}

	if err := db.FirstOrCreate(restaurantInfo, entities.RestaurantInfo{Name: "Sample Restaurant"}).Error; err != nil {
		return err
	}

	// Create operating hours
	operatingHours := []entities.OperatingHour{
		{DayOfWeek: 0, OpenTime: stringPtr("09:00"), CloseTime: stringPtr("23:00"), RestaurantInfoID: restaurantInfo.ID}, // Sunday
		{DayOfWeek: 1, OpenTime: stringPtr("09:00"), CloseTime: stringPtr("23:00"), RestaurantInfoID: restaurantInfo.ID}, // Monday
		{DayOfWeek: 2, OpenTime: stringPtr("09:00"), CloseTime: stringPtr("23:00"), RestaurantInfoID: restaurantInfo.ID}, // Tuesday
		{DayOfWeek: 3, OpenTime: stringPtr("09:00"), CloseTime: stringPtr("23:00"), RestaurantInfoID: restaurantInfo.ID}, // Wednesday
		{DayOfWeek: 4, OpenTime: stringPtr("09:00"), CloseTime: stringPtr("23:00"), RestaurantInfoID: restaurantInfo.ID}, // Thursday
		{DayOfWeek: 5, OpenTime: stringPtr("09:00"), CloseTime: stringPtr("24:00"), RestaurantInfoID: restaurantInfo.ID}, // Friday
		{DayOfWeek: 6, OpenTime: stringPtr("09:00"), CloseTime: stringPtr("24:00"), RestaurantInfoID: restaurantInfo.ID}, // Saturday
	}

	for _, oh := range operatingHours {
		if err := db.FirstOrCreate(&oh, entities.OperatingHour{
			DayOfWeek:        oh.DayOfWeek,
			RestaurantInfoID: oh.RestaurantInfoID,
		}).Error; err != nil {
			return err
		}
	}

	// Create content sections
	contentSections := []entities.ContentSection{
		{
			SectionName: "hero",
			Title:       "Welcome to Sample Restaurant",
			Content:     "Experience the finest dining with our authentic cuisine and exceptional service.",
			Metadata: entities.Metadata{
				"button_text": "View Menu",
				"button_link": "/menu",
			},
			Active: true,
		},
		{
			SectionName: "about",
			Title:       "Our Story",
			Content:     "Founded in 2020, Sample Restaurant has been serving authentic cuisine with a modern twist. Our chefs use only the freshest ingredients to create memorable dining experiences.",
			Metadata: entities.Metadata{
				"years_of_experience": 3,
				"chef_specialties":    []string{"Mediterranean", "Middle Eastern", "International"},
			},
			Active: true,
		},
		{
			SectionName: "location",
			Title:       "Visit Us",
			Content:     "Located in the heart of Dubai, we offer both indoor and outdoor seating with stunning city views.",
			Metadata: entities.Metadata{
				"parking":     true,
				"wifi":        true,
				"outdoor_seating": true,
				"reservations": true,
			},
			Active: true,
		},
	}

	for _, cs := range contentSections {
		if err := db.FirstOrCreate(&cs, entities.ContentSection{SectionName: cs.SectionName}).Error; err != nil {
			return err
		}
	}

	// Create sample categories
	categories := []entities.Category{
		{Name: "Appetizers", Description: "Start your meal with our delicious appetizers", DisplayOrder: 1, Active: true},
		{Name: "Main Courses", Description: "Our signature main dishes", DisplayOrder: 2, Active: true},
		{Name: "Desserts", Description: "Sweet endings to your perfect meal", DisplayOrder: 3, Active: true},
		{Name: "Beverages", Description: "Refreshing drinks and premium selections", DisplayOrder: 4, Active: true},
	}

	for _, cat := range categories {
		if err := db.FirstOrCreate(&cat, entities.Category{Name: cat.Name}).Error; err != nil {
			return err
		}
	}

	// Create sample subcategories
	var appetizersCategory, mainCoursesCategory, dessertsCategory, beveragesCategory entities.Category
	db.Where("name = ?", "Appetizers").First(&appetizersCategory)
	db.Where("name = ?", "Main Courses").First(&mainCoursesCategory)
	db.Where("name = ?", "Desserts").First(&dessertsCategory)
	db.Where("name = ?", "Beverages").First(&beveragesCategory)

	subCategories := []entities.SubCategory{
		{Name: "Cold Appetizers", Description: "Fresh and cold starters", CategoryID: appetizersCategory.ID, DisplayOrder: 1, Active: true},
		{Name: "Hot Appetizers", Description: "Warm and crispy appetizers", CategoryID: appetizersCategory.ID, DisplayOrder: 2, Active: true},
		{Name: "Grilled", Description: "Perfectly grilled dishes", CategoryID: mainCoursesCategory.ID, DisplayOrder: 1, Active: true},
		{Name: "Pasta", Description: "Fresh pasta dishes", CategoryID: mainCoursesCategory.ID, DisplayOrder: 2, Active: true},
		{Name: "Traditional Desserts", Description: "Classic sweet treats", CategoryID: dessertsCategory.ID, DisplayOrder: 1, Active: true},
		{Name: "Hot Beverages", Description: "Coffee, tea, and hot drinks", CategoryID: beveragesCategory.ID, DisplayOrder: 1, Active: true},
		{Name: "Cold Beverages", Description: "Refreshing cold drinks", CategoryID: beveragesCategory.ID, DisplayOrder: 2, Active: true},
	}

	for _, subCat := range subCategories {
		if err := db.FirstOrCreate(&subCat, entities.SubCategory{Name: subCat.Name, CategoryID: subCat.CategoryID}).Error; err != nil {
			return err
		}
	}

	// Create sample items
	var coldAppetizers, hotAppetizers, grilled, pasta, traditionalDesserts, hotBeverages, coldBeverages entities.SubCategory
	db.Where("name = ? AND category_id = ?", "Cold Appetizers", appetizersCategory.ID).First(&coldAppetizers)
	db.Where("name = ? AND category_id = ?", "Hot Appetizers", appetizersCategory.ID).First(&hotAppetizers)
	db.Where("name = ? AND category_id = ?", "Grilled", mainCoursesCategory.ID).First(&grilled)
	db.Where("name = ? AND category_id = ?", "Pasta", mainCoursesCategory.ID).First(&pasta)
	db.Where("name = ? AND category_id = ?", "Traditional Desserts", dessertsCategory.ID).First(&traditionalDesserts)
	db.Where("name = ? AND category_id = ?", "Hot Beverages", beveragesCategory.ID).First(&hotBeverages)
	db.Where("name = ? AND category_id = ?", "Cold Beverages", beveragesCategory.ID).First(&coldBeverages)

	items := []entities.Item{
		{
			Name:          "Hummus Plate",
			Description:   "Creamy hummus served with fresh vegetables and pita bread",
			Price:         25.00,
			Currency:      "AED",
			SubCategoryID: coldAppetizers.ID,
			DietaryInfo: entities.DietaryInfo{
				"vegetarian": true,
				"vegan":      true,
				"gluten_free": false,
			},
			Available:    true,
			DisplayOrder: 1,
		},
		{
			Name:          "Chicken Wings",
			Description:   "Spicy buffalo wings served with ranch dipping sauce",
			Price:         35.00,
			Currency:      "AED",
			SubCategoryID: hotAppetizers.ID,
			DietaryInfo: entities.DietaryInfo{
				"vegetarian": false,
				"vegan":      false,
				"spicy":      true,
			},
			Available:    true,
			DisplayOrder: 1,
		},
		{
			Name:          "Grilled Salmon",
			Description:   "Fresh Atlantic salmon with herbs and lemon",
			Price:         85.00,
			Currency:      "AED",
			SubCategoryID: grilled.ID,
			DietaryInfo: entities.DietaryInfo{
				"vegetarian": false,
				"vegan":      false,
				"healthy":    true,
			},
			Available:    true,
			DisplayOrder: 1,
		},
		{
			Name:          "Spaghetti Carbonara",
			Description:   "Classic Italian pasta with cream, eggs, and pancetta",
			Price:         55.00,
			Currency:      "AED",
			SubCategoryID: pasta.ID,
			DietaryInfo: entities.DietaryInfo{
				"vegetarian": false,
				"vegan":      false,
			},
			Available:    true,
			DisplayOrder: 1,
		},
		{
			Name:          "Tiramisu",
			Description:   "Classic Italian dessert with coffee and mascarpone",
			Price:         30.00,
			Currency:      "AED",
			SubCategoryID: traditionalDesserts.ID,
			DietaryInfo: entities.DietaryInfo{
				"vegetarian": true,
				"vegan":      false,
				"contains_coffee": true,
			},
			Available:    true,
			DisplayOrder: 1,
		},
		{
			Name:          "Espresso",
			Description:   "Strong Italian coffee",
			Price:         15.00,
			Currency:      "AED",
			SubCategoryID: hotBeverages.ID,
			DietaryInfo: entities.DietaryInfo{
				"vegetarian": true,
				"vegan":      true,
				"caffeine":   true,
			},
			Available:    true,
			DisplayOrder: 1,
		},
		{
			Name:          "Fresh Orange Juice",
			Description:   "Freshly squeezed orange juice",
			Price:         20.00,
			Currency:      "AED",
			SubCategoryID: coldBeverages.ID,
			DietaryInfo: entities.DietaryInfo{
				"vegetarian": true,
				"vegan":      true,
				"fresh":      true,
			},
			Available:    true,
			DisplayOrder: 1,
		},
	}

	for _, item := range items {
		if err := db.FirstOrCreate(&item, entities.Item{
			Name:          item.Name,
			SubCategoryID: item.SubCategoryID,
		}).Error; err != nil {
			return err
		}
	}

	return nil
}

func stringPtr(s string) *string {
	return &s
}