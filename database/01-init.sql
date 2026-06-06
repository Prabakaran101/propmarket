-- ──────────────────────────────────────────────────────────────
--  01-init.sql
--  Runs on FIRST container startup only.
--  By this point the database and user are already created
--  by the POSTGRES_DB / POSTGRES_USER env vars in the Dockerfile.
--  This script adds extensions and grants.
-- ──────────────────────────────────────────────────────────────

-- Enable UUID extension (available for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable case-insensitive text extension
CREATE EXTENSION IF NOT EXISTS "citext";

-- Grant all privileges to the app user on the database
GRANT ALL PRIVILEGES ON DATABASE realestatedb TO realestate;

-- Allow the app user to create tables, sequences, indexes
GRANT ALL ON SCHEMA public TO realestate;

-- Set default search path
ALTER USER realestate SET search_path TO public;

-- Log when init ran
DO $$
BEGIN
  RAISE NOTICE 'PropMarket DB init complete at %', NOW();
END $$;
