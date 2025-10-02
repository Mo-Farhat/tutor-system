/*
  Warnings:

  - You are about to drop the column `completedAt` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `tutorProfileUserId` on the `Lesson` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Lesson" DROP CONSTRAINT "Lesson_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lesson" DROP CONSTRAINT "Lesson_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Lesson" DROP CONSTRAINT "Lesson_tutorProfileUserId_fkey";

-- DropIndex
DROP INDEX "public"."Lesson_studentId_tutorId_startAt_idx";

-- AlterTable
ALTER TABLE "public"."Lesson" DROP COLUMN "completedAt",
DROP COLUMN "duration",
DROP COLUMN "tutorProfileUserId",
ADD COLUMN     "recurrenceRule" TEXT,
ADD COLUMN     "seriesId" TEXT;

-- CreateTable
CREATE TABLE "public"."LessonMaterial" (
    "id" SERIAL NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "title" TEXT,
    "type" TEXT,
    "path" TEXT,
    "url" TEXT,
    "addedBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ZoomLinkRegistry" (
    "id" SERIAL NOT NULL,
    "tutorId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZoomLinkRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonMaterial_lessonId_idx" ON "public"."LessonMaterial"("lessonId");

-- CreateIndex
CREATE INDEX "LessonMaterial_addedBy_idx" ON "public"."LessonMaterial"("addedBy");

-- CreateIndex
CREATE INDEX "ZoomLinkRegistry_tutorId_idx" ON "public"."ZoomLinkRegistry"("tutorId");

-- CreateIndex
CREATE INDEX "ZoomLinkRegistry_isDefault_idx" ON "public"."ZoomLinkRegistry"("isDefault");

-- CreateIndex
CREATE INDEX "Lesson_startAt_idx" ON "public"."Lesson"("startAt");

-- CreateIndex
CREATE INDEX "Lesson_tutorId_idx" ON "public"."Lesson"("tutorId");

-- CreateIndex
CREATE INDEX "Lesson_studentId_idx" ON "public"."Lesson"("studentId");

-- CreateIndex
CREATE INDEX "Lesson_status_idx" ON "public"."Lesson"("status");

-- CreateIndex
CREATE INDEX "Lesson_seriesId_idx" ON "public"."Lesson"("seriesId");

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LessonMaterial" ADD CONSTRAINT "LessonMaterial_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ZoomLinkRegistry" ADD CONSTRAINT "ZoomLinkRegistry_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
