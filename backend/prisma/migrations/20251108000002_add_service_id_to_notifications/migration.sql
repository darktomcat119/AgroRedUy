-- Add serviceId column to notifications table for linking to service pages
ALTER TABLE "notifications" 
ADD COLUMN IF NOT EXISTS "service_id" TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "notifications_service_id_idx" ON "notifications"("service_id");

