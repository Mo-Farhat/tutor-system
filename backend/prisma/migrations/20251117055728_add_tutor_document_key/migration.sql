/*
  Warnings:

  - You are about to drop the column `path` on the `LessonMaterial` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `TutorDocument` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."PipelineStage" AS ENUM ('initial_contact', 'academic_consultation', 'payment_method_added', 'first_paid_lesson', 'package_purchase', 'regular_sessions');

-- CreateEnum
CREATE TYPE "public"."PipelineStatus" AS ENUM ('pending', 'in_progress', 'completed');

-- AlterTable
ALTER TABLE "public"."LessonMaterial" DROP COLUMN "path",
ADD COLUMN     "assetId" INTEGER,
ADD COLUMN     "bucket" TEXT,
ADD COLUMN     "key" TEXT;

-- AlterTable
ALTER TABLE "public"."PaymentTransaction" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."StudentProfile" ADD COLUMN     "photoAssetId" INTEGER;

-- AlterTable
ALTER TABLE "public"."TutorDocument" DROP COLUMN "path",
ADD COLUMN     "assetId" INTEGER,
ADD COLUMN     "bucket" TEXT,
ADD COLUMN     "key" TEXT,
ADD COLUMN     "url" TEXT;

-- CreateTable
CREATE TABLE "public"."LessonPipeline" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "tutorId" INTEGER NOT NULL,
    "stage" "public"."PipelineStage" NOT NULL,
    "status" "public"."PipelineStatus" NOT NULL DEFAULT 'pending',
    "date" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonPipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MediaAsset" (
    "id" SERIAL NOT NULL,
    "ownerUserId" INTEGER,
    "key" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "contentType" TEXT,
    "size" INTEGER,
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonPipeline_studentId_tutorId_idx" ON "public"."LessonPipeline"("studentId", "tutorId");

-- CreateIndex
CREATE INDEX "LessonPipeline_status_idx" ON "public"."LessonPipeline"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LessonPipeline_studentId_tutorId_stage_key" ON "public"."LessonPipeline"("studentId", "tutorId", "stage");

-- CreateIndex
CREATE INDEX "MediaAsset_ownerUserId_idx" ON "public"."MediaAsset"("ownerUserId");

-- AddForeignKey
ALTER TABLE "public"."StudentProfile" ADD CONSTRAINT "StudentProfile_photoAssetId_fkey" FOREIGN KEY ("photoAssetId") REFERENCES "public"."MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorDocument" ADD CONSTRAINT "TutorDocument_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LessonMaterial" ADD CONSTRAINT "LessonMaterial_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LessonPipeline" ADD CONSTRAINT "LessonPipeline_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LessonPipeline" ADD CONSTRAINT "LessonPipeline_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MediaAsset" ADD CONSTRAINT "MediaAsset_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
