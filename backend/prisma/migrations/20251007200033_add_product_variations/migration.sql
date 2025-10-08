-- CreateEnum
CREATE TYPE "VariationGroupType" AS ENUM ('SINGLE_SELECT', 'MULTI_SELECT');

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN "selected_variations" JSONB;

-- CreateTable
CREATE TABLE "variation_groups" (
    "id" TEXT NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "VariationGroupType" NOT NULL DEFAULT 'SINGLE_SELECT',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variation_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variation_options" (
    "id" TEXT NOT NULL,
    "variation_group_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price_modifier" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variation_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "variation_groups_menu_item_id_idx" ON "variation_groups"("menu_item_id");

-- CreateIndex
CREATE INDEX "variation_options_variation_group_id_idx" ON "variation_options"("variation_group_id");

-- AddForeignKey
ALTER TABLE "variation_groups" ADD CONSTRAINT "variation_groups_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variation_options" ADD CONSTRAINT "variation_options_variation_group_id_fkey" FOREIGN KEY ("variation_group_id") REFERENCES "variation_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
