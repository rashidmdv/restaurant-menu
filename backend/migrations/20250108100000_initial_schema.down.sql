-- Rollback initial schema

-- Drop triggers
DROP TRIGGER IF EXISTS update_items_updated_at ON items;
DROP TRIGGER IF EXISTS update_sub_categories_updated_at ON sub_categories;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_content_sections_updated_at ON content_sections;
DROP TRIGGER IF EXISTS update_operating_hours_updated_at ON operating_hours;
DROP TRIGGER IF EXISTS update_restaurant_infos_updated_at ON restaurant_infos;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_items_price;
DROP INDEX IF EXISTS idx_items_display_order;
DROP INDEX IF EXISTS idx_items_available;
DROP INDEX IF EXISTS idx_items_sub_category_id;
DROP INDEX IF EXISTS idx_sub_categories_display_order;
DROP INDEX IF EXISTS idx_sub_categories_active;
DROP INDEX IF EXISTS idx_sub_categories_category_id;
DROP INDEX IF EXISTS idx_categories_display_order;
DROP INDEX IF EXISTS idx_categories_active;
DROP INDEX IF EXISTS idx_content_sections_active;
DROP INDEX IF EXISTS idx_operating_hours_restaurant_info_id;
DROP INDEX IF EXISTS idx_restaurant_infos_active;

-- Drop tables in reverse order of creation
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS sub_categories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS content_sections;
DROP TABLE IF EXISTS operating_hours;
DROP TABLE IF EXISTS restaurant_infos;

-- Drop extensions
DROP EXTENSION IF EXISTS "uuid-ossp";