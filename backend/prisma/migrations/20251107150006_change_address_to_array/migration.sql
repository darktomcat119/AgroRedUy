-- AlterTable: Change address column from TEXT to TEXT[] (array)
-- Convert existing text data to array format
ALTER TABLE "users" ALTER COLUMN "address" TYPE TEXT[] USING 
    CASE 
        WHEN "address" IS NULL THEN NULL
        WHEN "address" = '' THEN ARRAY[]::TEXT[]
        ELSE ARRAY["address"]
    END;

