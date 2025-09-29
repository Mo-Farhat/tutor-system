-- CreateEnum
CREATE TYPE "public"."PairStatus" AS ENUM ('active', 'paused', 'ended');

-- CreateEnum
CREATE TYPE "public"."GuardianRelation" AS ENUM ('mother', 'father', 'guardian', 'other');

-- CreateEnum
CREATE TYPE "public"."ContactPreference" AS ENUM ('email', 'phone', 'sms', 'any');

-- CreateTable
CREATE TABLE "public"."StudentTutor" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "tutorId" INTEGER NOT NULL,
    "subject" TEXT,
    "status" "public"."PairStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "tutorApplicationId" INTEGER,

    CONSTRAINT "StudentTutor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ParentContact" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "relation" "public"."GuardianRelation" NOT NULL DEFAULT 'guardian',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "contactPreference" "public"."ContactPreference",
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postcode" TEXT,
    "country" TEXT,
    "notes" TEXT,
    "consentToContact" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParentContact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentTutor_studentId_tutorId_idx" ON "public"."StudentTutor"("studentId", "tutorId");

-- CreateIndex
CREATE INDEX "ParentContact_studentId_idx" ON "public"."ParentContact"("studentId");

-- AddForeignKey
ALTER TABLE "public"."StudentTutor" ADD CONSTRAINT "StudentTutor_tutorApplicationId_fkey" FOREIGN KEY ("tutorApplicationId") REFERENCES "public"."TutorApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentTutor" ADD CONSTRAINT "StudentTutor_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentTutor" ADD CONSTRAINT "StudentTutor_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ParentContact" ADD CONSTRAINT "ParentContact_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
