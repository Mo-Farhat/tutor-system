/*
  Warnings:

  - A unique constraint covering the columns `[stripePaymentId]` on the table `PaymentTransaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSessionId]` on the table `PaymentTransaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripePaymentMethodId]` on the table `StudentPaymentMethod` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `PaymentTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."PaymentTransaction" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "stripePaymentId" TEXT,
ADD COLUMN     "stripeSessionId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."StudentPaymentMethod" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripePaymentMethodId" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "stripeCustomerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_stripePaymentId_key" ON "public"."PaymentTransaction"("stripePaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentTransaction_stripeSessionId_key" ON "public"."PaymentTransaction"("stripeSessionId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_stripePaymentId_idx" ON "public"."PaymentTransaction"("stripePaymentId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentPaymentMethod_stripePaymentMethodId_key" ON "public"."StudentPaymentMethod"("stripePaymentMethodId");

-- CreateIndex
CREATE INDEX "StudentPaymentMethod_stripePaymentMethodId_idx" ON "public"."StudentPaymentMethod"("stripePaymentMethodId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "public"."User"("stripeCustomerId");
