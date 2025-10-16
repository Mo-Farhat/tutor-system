-- CreateEnum
CREATE TYPE "public"."DiscountType" AS ENUM ('fixed', 'percent');

-- CreateEnum
CREATE TYPE "public"."PackageCatalogStatus" AS ENUM ('active', 'retired');

-- AlterTable
ALTER TABLE "public"."PackagePurchase" ADD COLUMN     "packageTypeId" INTEGER;

-- CreateTable
CREATE TABLE "public"."PackageType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "hours" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "discountType" "public"."DiscountType",
    "discountValueCents" INTEGER,
    "discountPercent" INTEGER,
    "description" TEXT,
    "validityMonths" INTEGER,
    "eligibleTiers" "public"."StudentTier"[],
    "refundable" BOOLEAN NOT NULL DEFAULT false,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."PackagePurchase" ADD CONSTRAINT "PackagePurchase_packageTypeId_fkey" FOREIGN KEY ("packageTypeId") REFERENCES "public"."PackageType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
