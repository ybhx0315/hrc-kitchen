-- AlterTable
-- Step 1: Add new weekdays column as array
ALTER TABLE "menu_items" ADD COLUMN "weekdays" "Weekday"[] DEFAULT ARRAY[]::"Weekday"[];

-- Step 2: Migrate existing data from weekday to weekdays
UPDATE "menu_items" SET "weekdays" = ARRAY[weekday];

-- Step 3: Drop old weekday column
ALTER TABLE "menu_items" DROP COLUMN "weekday";

-- Step 4: Drop old index and create new one
DROP INDEX IF EXISTS "menu_items_weekday_is_active_idx";
CREATE INDEX "menu_items_is_active_idx" ON "menu_items"("is_active");
