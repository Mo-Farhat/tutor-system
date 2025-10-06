-- AlterTable
ALTER TABLE "public"."Lesson" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "tutorProfileUserId" INTEGER;

-- AlterTable
ALTER TABLE "public"."TutorDocument" ADD COLUMN     "number" TEXT,
ADD COLUMN     "reviewedBy" INTEGER,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "tutorProfileUserId" INTEGER;

-- CreateTable
CREATE TABLE "public"."TutorChangeRequest" (
    "id" SERIAL NOT NULL,
    "tutorId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" INTEGER,

    CONSTRAINT "TutorChangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TutorReview" (
    "id" SERIAL NOT NULL,
    "tutorId" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'google',
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedBy" INTEGER NOT NULL,

    CONSTRAINT "TutorReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TutorDocument_status_expiresAt_idx" ON "public"."TutorDocument"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "TutorProfile_tier_is_live_idx" ON "public"."TutorProfile"("tier", "is_live");

-- CreateIndex
CREATE INDEX "TutorProfile_rating_idx" ON "public"."TutorProfile"("rating");

-- AddForeignKey
ALTER TABLE "public"."TutorDocument" ADD CONSTRAINT "TutorDocument_tutorProfileUserId_fkey" FOREIGN KEY ("tutorProfileUserId") REFERENCES "public"."TutorProfile"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Lesson" ADD CONSTRAINT "Lesson_tutorProfileUserId_fkey" FOREIGN KEY ("tutorProfileUserId") REFERENCES "public"."TutorProfile"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorChangeRequest" ADD CONSTRAINT "TutorChangeRequest_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "public"."TutorProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorReview" ADD CONSTRAINT "TutorReview_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "public"."TutorProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
