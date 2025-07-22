package seeds

import (
	"context"

	"restaurant-menu-api/internal/domain/entities"
	"gorm.io/gorm"
)

// seedContentSections creates the content sections for the website
func (s *Seeder) seedContentSections(ctx context.Context, db *gorm.DB) error {
	contentSections := []entities.ContentSection{
		{
			SectionName: "hero",
			Title:       "Welcome to Olive Grove Mediterranean",
			Content:     "Discover the authentic flavors of the Mediterranean in the heart of Dubai Marina. From traditional mezze to grilled specialties, every dish tells a story of culinary heritage passed down through generations.",
			Metadata: entities.Metadata{
				"background_image":  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920",
				"text_color":        "#FFFFFF",
				"overlay_opacity":   0.4,
				"button_text":       "View Our Menu",
				"button_link":       "/menu",
				"subtitle":          "Authentic Mediterranean Cuisine Since 2018",
				"display_order":     1,
			},
			ImageURL: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&q=80",
			Active:   true,
		},
		{
			SectionName: "story",
			Title:       "Our Story",
			Content:     "Olive Grove Mediterranean was born from a passion for authentic Mediterranean cuisine and a desire to bring the warmth of traditional hospitality to Dubai. Our chefs, trained in the coastal regions of Greece, Turkey, and Lebanon, craft each dish with carefully sourced ingredients and time-honored techniques. We believe that great food brings people together, creating memories that last a lifetime.",
			Metadata: entities.Metadata{
				"founder_name":      "Chef Maria & Ahmad Khalil",
				"established_year":  2018,
				"specialties":       []string{"Mezze Platters", "Grilled Seafood", "Traditional Desserts"},
				"awards":            []string{"Best Mediterranean Restaurant Dubai 2022", "TripAdvisor Certificate of Excellence 2021-2023"},
				"chef_background":   "Trained in authentic Mediterranean cooking techniques across Greece, Turkey, and Lebanon",
				"display_order":     2,
			},
			ImageURL: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
			Active:   true,
		},
		{
			SectionName: "location",
			Title:       "Visit Us in Dubai Marina",
			Content:     "Located on the stunning Marina Walk, Olive Grove offers breathtaking waterfront views alongside exceptional Mediterranean cuisine. Whether you're planning a romantic dinner, business lunch, or family celebration, our prime location and elegant ambiance provide the perfect setting.",
			Metadata: entities.Metadata{
				"address":           "Marina Walk, Building 23, Dubai Marina",
				"phone":             "+971-4-123-4567",
				"email":             "info@olivegroverestaurant.ae",
				"hours":             "Daily 11:00 AM - 11:00 PM",
				"parking":           "Complimentary valet parking available",
				"reservations":      "Recommended, especially on weekends",
				"private_dining":    "Private dining rooms available for events",
				"outdoor_seating":   "Waterfront terrace seating",
				"display_order":     3,
			},
			ImageURL: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
			Active:   true,
		},
		{
			SectionName: "experience",
			Title:       "The Mediterranean Experience",
			Content:     "Every visit to Olive Grove is a journey through the Mediterranean. From our warm hospitality and traditional music to the aroma of fresh herbs and spices, we transport you to the sun-soaked shores of the Mediterranean Sea. Our open kitchen concept allows you to witness the artistry behind each dish.",
			Metadata: entities.Metadata{
				"ambiance":          "Warm, elegant Mediterranean atmosphere",
				"music":             "Traditional Mediterranean and contemporary lounge",
				"dress_code":        "Smart casual",
				"capacity":          120,
				"special_features":  []string{"Open Kitchen", "Live Cooking Stations", "Waterfront Views", "Private Dining"},
				"suitable_for":      []string{"Date Night", "Family Dinner", "Business Meeting", "Special Celebrations"},
				"display_order":     4,
			},
			ImageURL: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80",
			Active:   true,
		},
		{
			SectionName: "people",
			Title:       "Meet Our Culinary Team",
			Content:     "Our passionate team of chefs and hospitality professionals are dedicated to providing you with an unforgettable dining experience. Led by Executive Chef Maria Komnenos and Sous Chef Ahmad Khalil, our kitchen team brings over 40 years of combined experience in Mediterranean cuisine.",
			Metadata: entities.Metadata{
				"executive_chef":    "Chef Maria Komnenos",
				"sous_chef":        "Chef Ahmad Khalil",
				"chef_specialties": "Authentic Greek and Lebanese cuisine",
				"team_size":        25,
				"languages":        []string{"English", "Arabic", "Greek", "Hindi"},
				"experience_years": 40,
				"display_order":    5,
			},
			ImageURL: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
			Active:   true,
		},
		{
			SectionName: "events",
			Title:       "Private Events & Catering",
			Content:     "Make your special occasions memorable with Olive Grove's private dining and catering services. From intimate gatherings to corporate events, we offer customized menus and dedicated service to ensure your event is perfectly executed.",
			Metadata: entities.Metadata{
				"private_rooms":     2,
				"max_capacity":      50,
				"catering_available": true,
				"event_types":       []string{"Corporate Events", "Wedding Parties", "Birthday Celebrations", "Anniversary Dinners"},
				"advance_booking":   "48 hours minimum",
				"custom_menus":      true,
				"display_order":     6,
			},
			ImageURL: "https://images.unsplash.com/photo-1519671282429-b44660ead0a7?w=800&q=80",
			Active:   true,
		},
	}

	for _, section := range contentSections {
		// Check if section already exists
		var existing entities.ContentSection
		if err := db.Where("section_name = ?", section.SectionName).First(&existing).Error; err == nil {
			s.logger.WithField("section", section.SectionName).Info("Content section already exists, skipping...")
			continue
		}

		if err := db.Create(&section).Error; err != nil {
			return err
		}

		s.logger.WithField("section", section.SectionName).Info("Content section seeded successfully")
	}

	s.logger.Info("All content sections seeded successfully")
	return nil
}