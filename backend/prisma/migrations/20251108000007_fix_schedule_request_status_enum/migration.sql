-- Create ScheduleRequestStatus enum type
DO $$ BEGIN
    CREATE TYPE "ScheduleRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create NotificationType enum type
DO $$ BEGIN
    CREATE TYPE "NotificationType" AS ENUM ('SCHEDULE_REQUEST', 'SCHEDULE_ACCEPTED', 'SCHEDULE_REJECTED', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'GENERAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Alter schedule_requests.status column to use enum type
DO $$ 
BEGIN
    -- First, ensure all existing values are valid enum values
    UPDATE "schedule_requests" SET "status" = 'PENDING' WHERE "status" NOT IN ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');
    
    -- Alter column type to use enum
    ALTER TABLE "schedule_requests" 
    ALTER COLUMN "status" TYPE "ScheduleRequestStatus" 
    USING "status"::"ScheduleRequestStatus";
    
    -- Set default value
    ALTER TABLE "schedule_requests" 
    ALTER COLUMN "status" SET DEFAULT 'PENDING';
EXCEPTION
    WHEN OTHERS THEN
        -- If column already has correct type, ignore error
        RAISE NOTICE 'Column status might already be correct type';
END $$;

-- Alter notifications.type column to use enum type
DO $$ 
BEGIN
    -- First, ensure all existing values are valid enum values
    UPDATE "notifications" SET "type" = 'GENERAL' WHERE "type" NOT IN ('SCHEDULE_REQUEST', 'SCHEDULE_ACCEPTED', 'SCHEDULE_REJECTED', 'BOOKING_CONFIRMED', 'BOOKING_CANCELLED', 'GENERAL');
    
    -- Alter column type to use enum
    ALTER TABLE "notifications" 
    ALTER COLUMN "type" TYPE "NotificationType" 
    USING "type"::"NotificationType";
EXCEPTION
    WHEN OTHERS THEN
        -- If column already has correct type, ignore error
        RAISE NOTICE 'Column type might already be correct type';
END $$;

