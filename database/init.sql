-- PropMarket Real Estate Database Initialization
-- This script runs on first PostgreSQL startup

-- Create database (already created by POSTGRES_DB env var)
-- Additional setup below

-- Enable UUID extension (optional, for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create optimized indexes after Hibernate auto-creates tables
-- Note: Hibernate creates tables via spring.jpa.hibernate.ddl-auto=update
-- These indexes boost query performance

-- We use a DO block so these run after tables exist
DO $$
BEGIN
    -- Listings table indexes
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'listings') THEN
        CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
        CREATE INDEX IF NOT EXISTS idx_listings_listing_type ON listings(listing_type);
        CREATE INDEX IF NOT EXISTS idx_listings_property_type ON listings(property_type);
        CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
        CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON listings(owner_id);
        CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
        CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
    END IF;

    -- Users table indexes
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
    END IF;

    -- Listing images indexes
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'listing_images') THEN
        CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images(listing_id);
    END IF;
END $$;
