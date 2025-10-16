/*
  Warnings:

  - You are about to drop the column `tutorId` on the `TutorReview` table. All the data in the column will be lost.
  - Added the required column `tutorUserId` to the `TutorReview` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."TutorReview" DROP CONSTRAINT "TutorReview_tutorId_fkey";

-- AlterTable
ALTER TABLE "public"."TutorReview" DROP COLUMN "tutorId",
ADD COLUMN     "tutorProfileUserId" INTEGER,
ADD COLUMN     "tutorUserId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "TutorReview_tutorUserId_createdAt_idx" ON "public"."TutorReview"("tutorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."TutorReview" ADD CONSTRAINT "TutorReview_tutorUserId_fkey" FOREIGN KEY ("tutorUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorReview" ADD CONSTRAINT "TutorReview_tutorProfileUserId_fkey" FOREIGN KEY ("tutorProfileUserId") REFERENCES "public"."TutorProfile"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
