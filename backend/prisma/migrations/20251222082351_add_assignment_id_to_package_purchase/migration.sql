/*
  Warnings:

  - The values [silver,bronze] on the enum `Tier` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."NotificationType" ADD VALUE 'session_confirm_request';
ALTER TYPE "public"."NotificationType" ADD VALUE 'session_confirmed';
ALTER TYPE "public"."NotificationType" ADD VALUE 'session_disputed';
ALTER TYPE "public"."NotificationType" ADD VALUE 'bucket_low_warning';
ALTER TYPE "public"."NotificationType" ADD VALUE 'overage_charged';
ALTER TYPE "public"."NotificationType" ADD VALUE 'payout_processed';

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Tier_new" AS ENUM ('gold', 'premium', 'elite');
ALTER TABLE "public"."TutorProfile" ALTER COLUMN "tier" DROP DEFAULT;
ALTER TABLE "public"."TutorProfile" ALTER COLUMN "tier" TYPE "public"."Tier_new" USING ("tier"::text::"public"."Tier_new");
ALTER TYPE "public"."Tier" RENAME TO "Tier_old";
ALTER TYPE "public"."Tier_new" RENAME TO "Tier";
DROP TYPE "public"."Tier_old";
ALTER TABLE "public"."TutorProfile" ALTER COLUMN "tier" SET DEFAULT 'gold';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Lesson" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "confirmationNotes" TEXT,
ADD COLUMN     "deliveryMode" TEXT NOT NULL DEFAULT 'online',
ADD COLUMN     "studentConfirmed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."PackagePurchase" ADD COLUMN     "assignmentId" INTEGER;

-- AlterTable
ALTER TABLE "public"."StudentTutor" ADD COLUMN     "autoRenew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPhysical" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "remainingHours" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."TutorProfile" ADD COLUMN     "stripeConnectAccountId" TEXT,
ADD COLUMN     "stripeOnboardingComplete" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."MasterTier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hourlyRate" DECIMAL(10,2) NOT NULL,
    "striveCut" DECIMAL(10,2) NOT NULL,
    "payoutRate" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TutorPayout" (
    "id" SERIAL NOT NULL,
    "tutorId" INTEGER NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "grossAmount" DECIMAL(10,2) NOT NULL,
    "striveCut" DECIMAL(10,2) NOT NULL,
    "netPayout" DECIMAL(10,2) NOT NULL,
    "travelFee" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorPayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SessionAudit" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "durationHours" DECIMAL(10,2) NOT NULL,
    "baseCharge" DECIMAL(10,2) NOT NULL,
    "travelFee" DECIMAL(10,2),
    "overageAmount" DECIMAL(10,2),
    "striveCut" DECIMAL(10,2) NOT NULL,
    "tutorPayout" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TutorPayout_lessonId_key" ON "public"."TutorPayout"("lessonId");

-- CreateIndex
CREATE INDEX "TutorPayout_tutorId_idx" ON "public"."TutorPayout"("tutorId");

-- CreateIndex
CREATE INDEX "TutorPayout_status_idx" ON "public"."TutorPayout"("status");

-- CreateIndex
CREATE INDEX "TutorPayout_createdAt_idx" ON "public"."TutorPayout"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SessionAudit_lessonId_key" ON "public"."SessionAudit"("lessonId");

-- CreateIndex
CREATE INDEX "SessionAudit_createdAt_idx" ON "public"."SessionAudit"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."PackagePurchase" ADD CONSTRAINT "PackagePurchase_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "public"."StudentTutor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorPayout" ADD CONSTRAINT "TutorPayout_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorPayout" ADD CONSTRAINT "TutorPayout_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SessionAudit" ADD CONSTRAINT "SessionAudit_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
