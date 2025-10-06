/*
  Warnings:

  - Added the required column `updatedAt` to the `TutorChangeRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."TutorChangeRequest" DROP CONSTRAINT "TutorChangeRequest_tutorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TutorReview" DROP CONSTRAINT "TutorReview_tutorUserId_fkey";

-- DropIndex
DROP INDEX "public"."TutorReview_tutorUserId_createdAt_idx";

-- AlterTable
ALTER TABLE "public"."TutorChangeRequest" ADD COLUMN     "tutorProfileUserId" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "TutorChangeRequest_tutorId_idx" ON "public"."TutorChangeRequest"("tutorId");

-- CreateIndex
CREATE INDEX "TutorChangeRequest_status_idx" ON "public"."TutorChangeRequest"("status");

-- CreateIndex
CREATE INDEX "TutorChangeRequest_reviewedBy_idx" ON "public"."TutorChangeRequest"("reviewedBy");

-- CreateIndex
CREATE INDEX "TutorReview_tutorUserId_idx" ON "public"."TutorReview"("tutorUserId");

-- CreateIndex
CREATE INDEX "TutorReview_addedBy_idx" ON "public"."TutorReview"("addedBy");

-- AddForeignKey
ALTER TABLE "public"."TutorChangeRequest" ADD CONSTRAINT "TutorChangeRequest_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorChangeRequest" ADD CONSTRAINT "TutorChangeRequest_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorChangeRequest" ADD CONSTRAINT "TutorChangeRequest_tutorProfileUserId_fkey" FOREIGN KEY ("tutorProfileUserId") REFERENCES "public"."TutorProfile"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorReview" ADD CONSTRAINT "TutorReview_tutorUserId_fkey" FOREIGN KEY ("tutorUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorReview" ADD CONSTRAINT "TutorReview_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
