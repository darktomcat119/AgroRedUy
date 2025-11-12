-- Add radius column to services table
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "radius" INTEGER;

