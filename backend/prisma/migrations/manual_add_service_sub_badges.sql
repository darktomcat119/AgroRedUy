-- Create service_sub_badges table
CREATE TABLE IF NOT EXISTS "service_sub_badges" (
    "id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon_url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "service_sub_badges_pkey" PRIMARY KEY ("id")
);

-- Create foreign key constraint
ALTER TABLE "service_sub_badges" ADD CONSTRAINT "service_sub_badges_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "service_sub_badges_service_id_idx" ON "service_sub_badges"("service_id");
CREATE INDEX IF NOT EXISTS "service_sub_badges_sort_order_idx" ON "service_sub_badges"("sort_order");


