/*
  Warnings:

  - Added the required column `priceDollars` to the `PackageType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PackageType" ADD COLUMN     "discountValueDollars" DECIMAL(10,2),
ADD COLUMN     "priceDollars" DECIMAL(10,2) NOT NULL;
