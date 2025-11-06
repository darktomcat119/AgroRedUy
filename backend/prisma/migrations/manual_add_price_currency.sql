-- AlterTable
ALTER TABLE "services"
ADD COLUMN IF NOT EXISTS "price_currency" TEXT NOT NULL DEFAULT 'UYU';

