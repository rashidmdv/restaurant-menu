-- Initialize database with extensions and initial setup
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE restaurant_menu'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'restaurant_menu')\gexec

-- Connect to the restaurant_menu database
\c restaurant_menu;

-- Enable extensions on the database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance (these will be created by GORM migrations as well)
-- But having them here ensures they exist even if migrations haven't run yet

-- Note: The actual table creation and schema will be handled by GORM migrations
-- This script is mainly for database initialization and extensions