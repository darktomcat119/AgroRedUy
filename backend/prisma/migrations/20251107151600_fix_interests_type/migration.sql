-- AlterTable: Ensure interests column is TEXT[] (array)
-- First, convert NULL values to empty array
UPDATE "users" SET "interests" = ARRAY[]::TEXT[] WHERE "interests" IS NULL;

-- Set default and make NOT NULL
ALTER TABLE "users" ALTER COLUMN "interests" SET DEFAULT '{}';
ALTER TABLE "users" ALTER COLUMN "interests" SET NOT NULL;

