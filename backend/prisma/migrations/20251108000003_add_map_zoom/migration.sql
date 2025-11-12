-- Safely add map_zoom column to services table
ALTER TABLE "services"
ADD COLUMN IF NOT EXISTS "map_zoom" INTEGER NOT NULL DEFAULT 6;


