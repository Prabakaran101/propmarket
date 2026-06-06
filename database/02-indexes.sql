-- ──────────────────────────────────────────────────────────────
--  02-indexes.sql
--  Runs on FIRST container startup only, after 01-init.sql.
--
--  Hibernate (Spring Boot) creates all tables automatically via
--  spring.jpa.hibernate.ddl-auto=update when the backend starts.
--
--  These indexes will be applied the FIRST time this container
--  starts AND each time via a startup hook if tables already exist.
--
--  If tables don't exist yet (backend hasn't started),
--  the DO block safely skips index creation with no error.
--  Indexes can also be created manually after the backend is running:
--    psql -U realestate -d realestatedb -f 02-indexes.sql
-- ──────────────────────────────────────────────────────────────

DO $$
BEGIN

  -- ── users table ──────────────────────────────────────────────
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'users'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_users_email
      ON users(email);

    CREATE INDEX IF NOT EXISTS idx_users_phone
      ON users(phone);

    RAISE NOTICE 'users indexes created';
  ELSE
    RAISE NOTICE 'users table not found — skipping indexes (backend not started yet)';
  END IF;

  -- ── listings table ────────────────────────────────────────────
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'listings'
  ) THEN
    -- Filter queries
    CREATE INDEX IF NOT EXISTS idx_listings_status
      ON listings(status);

    CREATE INDEX IF NOT EXISTS idx_listings_listing_type
      ON listings(listing_type);

    CREATE INDEX IF NOT EXISTS idx_listings_property_type
      ON listings(property_type);

    -- Search by city (used in all search queries)
    CREATE INDEX IF NOT EXISTS idx_listings_city
      ON listings(LOWER(city));

    -- Foreign key join
    CREATE INDEX IF NOT EXISTS idx_listings_owner_id
      ON listings(owner_id);

    -- Price range filter
    CREATE INDEX IF NOT EXISTS idx_listings_price
      ON listings(price);

    -- Default sort (newest first)
    CREATE INDEX IF NOT EXISTS idx_listings_created_at
      ON listings(created_at DESC);

    -- Popular sort
    CREATE INDEX IF NOT EXISTS idx_listings_view_count
      ON listings(view_count DESC);

    -- Composite index for most common search pattern
    CREATE INDEX IF NOT EXISTS idx_listings_status_type_city
      ON listings(status, listing_type, LOWER(city));

    RAISE NOTICE 'listings indexes created';
  ELSE
    RAISE NOTICE 'listings table not found — skipping indexes (backend not started yet)';
  END IF;

  -- ── listing_images table ──────────────────────────────────────
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'listing_images'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id
      ON listing_images(listing_id);

    CREATE INDEX IF NOT EXISTS idx_listing_images_order
      ON listing_images(listing_id, display_order);

    RAISE NOTICE 'listing_images indexes created';
  ELSE
    RAISE NOTICE 'listing_images table not found — skipping indexes (backend not started yet)';
  END IF;

END $$;
