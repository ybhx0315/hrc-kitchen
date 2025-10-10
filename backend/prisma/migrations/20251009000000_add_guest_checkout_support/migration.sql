-- AlterTable: Make userId optional and add guest fields
ALTER TABLE "orders" ALTER COLUMN "user_id" DROP NOT NULL;

ALTER TABLE "orders" ADD COLUMN "guest_email" TEXT;
ALTER TABLE "orders" ADD COLUMN "guest_first_name" TEXT;
ALTER TABLE "orders" ADD COLUMN "guest_last_name" TEXT;

-- CreateIndex: Add index for guest email lookups
CREATE INDEX "orders_guest_email_idx" ON "orders"("guest_email");
