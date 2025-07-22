package seeds

import (
	"context"

	"restaurant-menu-api/internal/domain/entities"
	"gorm.io/gorm"
)

// seedCategories creates the main menu categories
func (s *Seeder) seedCategories(ctx context.Context, db *gorm.DB) error {
	categories := []entities.Category{
		{
			Name:         "Appetizers",
			Description:  "Traditional Mediterranean appetizers and mezze to start your culinary journey",
			DisplayOrder: 1,
			Active:       true,
		},
		{
			Name:         "Main Courses",
			Description:  "Hearty Mediterranean main dishes featuring fresh seafood, grilled meats, and traditional specialties",
			DisplayOrder: 2,
			Active:       true,
		},
		{
			Name:         "Desserts",
			Description:  "Traditional Mediterranean sweets and desserts to complete your dining experience",
			DisplayOrder: 3,
			Active:       true,
		},
		{
			Name:         "Beverages",
			Description:  "Refreshing drinks, traditional teas, coffee, and Mediterranean-inspired beverages",
			DisplayOrder: 4,
			Active:       true,
		},
	}

	for _, category := range categories {
		// Check if category already exists
		var existing entities.Category
		if err := db.Where("name = ?", category.Name).First(&existing).Error; err == nil {
			s.logger.WithField("category", category.Name).Info("Category already exists, skipping...")
			continue
		}

		if err := db.Create(&category).Error; err != nil {
			return err
		}

		s.logger.WithField("category", category.Name).Info("Category seeded successfully")
	}

	s.logger.Info("All categories seeded successfully")
	return nil
}

// seedSubCategories creates subcategories under each main category
func (s *Seeder) seedSubCategories(ctx context.Context, db *gorm.DB) error {
	// Get category IDs
	var categories []entities.Category
	if err := db.Find(&categories).Error; err != nil {
		return err
	}

	categoryMap := make(map[string]uint)
	for _, cat := range categories {
		categoryMap[cat.Name] = cat.ID
	}

	subCategories := []entities.SubCategory{
		// Appetizers subcategories
		{
			Name:         "Cold Mezze",
			Description:  "Traditional cold appetizers served at room temperature",
			CategoryID:   categoryMap["Appetizers"],
			DisplayOrder: 1,
			Active:       true,
		},
		{
			Name:         "Hot Mezze",
			Description:  "Warm appetizers and freshly prepared hot starters",
			CategoryID:   categoryMap["Appetizers"],
			DisplayOrder: 2,
			Active:       true,
		},
		
		// Main Courses subcategories
		{
			Name:         "Grills & BBQ",
			Description:  "Charcoal-grilled meats, seafood, and vegetables",
			CategoryID:   categoryMap["Main Courses"],
			DisplayOrder: 1,
			Active:       true,
		},
		{
			Name:         "Traditional Dishes",
			Description:  "Authentic Mediterranean recipes passed down through generations",
			CategoryID:   categoryMap["Main Courses"],
			DisplayOrder: 2,
			Active:       true,
		},
		{
			Name:         "Seafood Specialties",
			Description:  "Fresh catch of the day prepared Mediterranean style",
			CategoryID:   categoryMap["Main Courses"],
			DisplayOrder: 3,
			Active:       true,
		},
		
		// Desserts subcategories
		{
			Name:         "Traditional Sweets",
			Description:  "Classic Mediterranean desserts made with traditional recipes",
			CategoryID:   categoryMap["Desserts"],
			DisplayOrder: 1,
			Active:       true,
		},
		{
			Name:         "Modern Creations",
			Description:  "Contemporary desserts with Mediterranean influences",
			CategoryID:   categoryMap["Desserts"],
			DisplayOrder: 2,
			Active:       true,
		},
		
		// Beverages subcategories
		{
			Name:         "Hot Beverages",
			Description:  "Traditional teas, coffee, and warm drinks",
			CategoryID:   categoryMap["Beverages"],
			DisplayOrder: 1,
			Active:       true,
		},
		{
			Name:         "Cold Beverages",
			Description:  "Refreshing cold drinks, juices, and specialty beverages",
			CategoryID:   categoryMap["Beverages"],
			DisplayOrder: 2,
			Active:       true,
		},
		{
			Name:         "Fresh Juices",
			Description:  "Freshly squeezed fruit and vegetable juices",
			CategoryID:   categoryMap["Beverages"],
			DisplayOrder: 3,
			Active:       true,
		},
	}

	for _, subCategory := range subCategories {
		// Check if subcategory already exists
		var existing entities.SubCategory
		if err := db.Where("name = ? AND category_id = ?", subCategory.Name, subCategory.CategoryID).First(&existing).Error; err == nil {
			s.logger.WithField("subcategory", subCategory.Name).Info("SubCategory already exists, skipping...")
			continue
		}

		if err := db.Create(&subCategory).Error; err != nil {
			return err
		}

		s.logger.WithField("subcategory", subCategory.Name).Info("SubCategory seeded successfully")
	}

	s.logger.Info("All subcategories seeded successfully")
	return nil
}

// seedItems creates menu items under each subcategory
func (s *Seeder) seedItems(ctx context.Context, db *gorm.DB) error {
	// Get subcategory IDs
	var subCategories []entities.SubCategory
	if err := db.Find(&subCategories).Error; err != nil {
		return err
	}

	subCategoryMap := make(map[string]uint)
	for _, subCat := range subCategories {
		subCategoryMap[subCat.Name] = subCat.ID
	}

	items := []entities.Item{
		// Cold Mezze items
		{
			Name:          "Hummus Traditional",
			Description:   "Creamy blend of chickpeas, tahini, lemon juice, and olive oil, served with warm pita bread",
			Price:         28.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": true, "vegan": true, "gluten_free": false, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1571197119282-7c4bf72c4307?w=400&q=80",
			SubCategoryID: subCategoryMap["Cold Mezze"],
			Available:     true,
			DisplayOrder:  1,
		},
		{
			Name:          "Baba Ghanoush",
			Description:   "Smoky roasted eggplant dip with tahini, garlic, and pomegranate seeds",
			Price:         32.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": true, "vegan": true, "gluten_free": false, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1580554530778-ca36943938b2?w=400&q=80",
			SubCategoryID: subCategoryMap["Cold Mezze"],
			Available:     true,
			DisplayOrder:  2,
		},
		{
			Name:          "Tabbouleh Salad",
			Description:   "Fresh parsley salad with tomatoes, onions, mint, bulgur, lemon juice and olive oil",
			Price:         35.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": true, "vegan": true, "gluten_free": false, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1564671165093-20688ff1ffed?w=400&q=80",
			SubCategoryID: subCategoryMap["Cold Mezze"],
			Available:     true,
			DisplayOrder:  3,
		},
		{
			Name:          "Labneh with Za'atar",
			Description:   "Thick, creamy strained yogurt topped with za'atar spice blend and olive oil",
			Price:         25.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": true, "vegan": false, "gluten_free": true, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1599021148794-5e37e13b5e05?w=400&q=80",
			SubCategoryID: subCategoryMap["Cold Mezze"],
			Available:     true,
			DisplayOrder:  4,
		},

		// Hot Mezze items
		{
			Name:          "Kibbeh Fried",
			Description:   "Traditional Lebanese fried bulgur and meat croquettes with pine nuts and spices",
			Price:         45.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": false, "vegan": false, "gluten_free": false, "spicy": true},
			ImageURL:      "https://images.unsplash.com/photo-1622563736743-a4e8e6a46c2c?w=400&q=80",
			SubCategoryID: subCategoryMap["Hot Mezze"],
			Available:     true,
			DisplayOrder:  1,
		},
		{
			Name:          "Halloumi Grilled",
			Description:   "Traditional Cypriot cheese grilled to perfection with herbs and olive oil",
			Price:         42.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": true, "vegan": false, "gluten_free": true, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1571197119282-7c4bf72c4307?w=400&q=80",
			SubCategoryID: subCategoryMap["Hot Mezze"],
			Available:     true,
			DisplayOrder:  2,
		},
		{
			Name:          "Falafel Plate",
			Description:   "Crispy chickpea fritters served with tahini sauce and pickled vegetables",
			Price:         38.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": true, "vegan": true, "gluten_free": false, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1597969267536-92ac99c8d3a4?w=400&q=80",
			SubCategoryID: subCategoryMap["Hot Mezze"],
			Available:     true,
			DisplayOrder:  3,
		},

		// Grills & BBQ items
		{
			Name:          "Mixed Grill Platter",
			Description:   "Combination of lamb kofta, chicken shish, and beef kebab with grilled vegetables",
			Price:         125.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": false, "vegan": false, "gluten_free": true, "spicy": true},
			ImageURL:      "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80",
			SubCategoryID: subCategoryMap["Grills & BBQ"],
			Available:     true,
			DisplayOrder:  1,
		},
		{
			Name:          "Lamb Chops",
			Description:   "Tender lamb chops marinated in Mediterranean herbs and grilled over charcoal",
			Price:         95.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": false, "vegan": false, "gluten_free": true, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&q=80",
			SubCategoryID: subCategoryMap["Grills & BBQ"],
			Available:     true,
			DisplayOrder:  2,
		},
		{
			Name:          "Chicken Shish Tawook",
			Description:   "Marinated chicken breast cubes grilled with peppers and onions",
			Price:         75.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": false, "vegan": false, "gluten_free": true, "spicy": true},
			ImageURL:      "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&q=80",
			SubCategoryID: subCategoryMap["Grills & BBQ"],
			Available:     true,
			DisplayOrder:  3,
		},

		// Traditional Dishes items
		{
			Name:          "Lamb Ouzi",
			Description:   "Slow-roasted lamb shoulder with spiced rice, almonds, and raisins",
			Price:         110.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": false, "vegan": false, "gluten_free": true, "spicy": true},
			ImageURL:      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&q=80",
			SubCategoryID: subCategoryMap["Traditional Dishes"],
			Available:     true,
			DisplayOrder:  1,
		},
		{
			Name:          "Chicken Mansaf",
			Description:   "Traditional Jordanian dish with tender chicken in creamy yogurt sauce over rice",
			Price:         88.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": false, "vegan": false, "gluten_free": true, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&q=80",
			SubCategoryID: subCategoryMap["Traditional Dishes"],
			Available:     true,
			DisplayOrder:  2,
		},
		{
			Name:          "Vegetarian Moussaka",
			Description:   "Layers of eggplant, zucchini, and potato with rich tomato sauce and béchamel",
			Price:         65.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": true, "vegan": false, "gluten_free": false, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1621421372484-e4dcfe3af6e6?w=400&q=80",
			SubCategoryID: subCategoryMap["Traditional Dishes"],
			Available:     true,
			DisplayOrder:  3,
		},

		// Seafood Specialties items
		{
			Name:          "Sea Bass Grilled",
			Description:   "Fresh sea bass grilled with lemon, herbs, and Mediterranean vegetables",
			Price:         85.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": false, "vegan": false, "gluten_free": true, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1568565148261-f0b3c4e1f89a?w=400&q=80",
			SubCategoryID: subCategoryMap["Seafood Specialties"],
			Available:     true,
			DisplayOrder:  1,
		},
		{
			Name:          "Seafood Paella",
			Description:   "Traditional Spanish rice dish with prawns, mussels, calamari, and saffron",
			Price:         98.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": false, "vegan": false, "gluten_free": true, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&q=80",
			SubCategoryID: subCategoryMap["Seafood Specialties"],
			Available:     true,
			DisplayOrder:  2,
		},

		// Traditional Sweets items
		{
			Name:          "Baklava Assorted",
			Description:   "Traditional flaky pastry layered with nuts and sweetened with honey syrup",
			Price:         35.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": true, "vegan": false, "gluten_free": false, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&q=80",
			SubCategoryID: subCategoryMap["Traditional Sweets"],
			Available:     true,
			DisplayOrder:  1,
		},
		{
			Name:          "Knafeh with Cheese",
			Description:   "Traditional Palestinian dessert with shredded phyllo, cheese, and orange blossom syrup",
			Price:         42.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": true, "vegan": false, "gluten_free": false, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400&q=80",
			SubCategoryID: subCategoryMap["Traditional Sweets"],
			Available:     true,
			DisplayOrder:  2,
		},
		{
			Name:          "Muhallabia",
			Description:   "Creamy milk pudding with rose water, topped with pistachios and almonds",
			Price:         28.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": true, "vegan": false, "gluten_free": true, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&q=80",
			SubCategoryID: subCategoryMap["Traditional Sweets"],
			Available:     true,
			DisplayOrder:  3,
		},

		// Hot Beverages items
		{
			Name:          "Turkish Coffee",
			Description:   "Traditional strong coffee brewed in a cezve, served with Turkish delight",
			Price:         18.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": true, "vegan": true, "gluten_free": true, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400&q=80",
			SubCategoryID: subCategoryMap["Hot Beverages"],
			Available:     true,
			DisplayOrder:  1,
		},
		{
			Name:          "Mint Tea",
			Description:   "Refreshing blend of green tea with fresh mint leaves and honey",
			Price:         15.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": true, "vegan": true, "gluten_free": true, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1549479258-ca82553f5904?w=400&q=80",
			SubCategoryID: subCategoryMap["Hot Beverages"],
			Available:     true,
			DisplayOrder:  2,
		},

		// Fresh Juices items
		{
			Name:          "Fresh Orange Juice",
			Description:   "Freshly squeezed Valencia oranges, served chilled",
			Price:         22.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": true, "vegan": true, "gluten_free": true, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80",
			SubCategoryID: subCategoryMap["Fresh Juices"],
			Available:     true,
			DisplayOrder:  1,
		},
		{
			Name:          "Pomegranate Juice",
			Description:   "Fresh pomegranate juice with a touch of rose water",
			Price:         28.00,
			Currency:      "AED",
			DietaryInfo:   entities.DietaryInfo{"vegetarian": true, "vegan": true, "gluten_free": true, "spicy": false},
			ImageURL:      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80",
			SubCategoryID: subCategoryMap["Fresh Juices"],
			Available:     true,
			DisplayOrder:  2,
		},
	}

	for _, item := range items {
		// Check if item already exists
		var existing entities.Item
		if err := db.Where("name = ? AND sub_category_id = ?", item.Name, item.SubCategoryID).First(&existing).Error; err == nil {
			s.logger.WithField("item", item.Name).Info("Item already exists, skipping...")
			continue
		}

		if err := db.Create(&item).Error; err != nil {
			return err
		}

		s.logger.WithField("item", item.Name).Info("Item seeded successfully")
	}

	s.logger.Info("All menu items seeded successfully")
	return nil
}