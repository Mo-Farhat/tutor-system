-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('student', 'tutor', 'admin');

-- CreateEnum
CREATE TYPE "public"."Tier" AS ENUM ('gold', 'silver', 'bronze');

-- CreateEnum
CREATE TYPE "public"."AppStatus" AS ENUM ('pending', 'approved', 'onboarded', 'rejected');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'student',
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TutorApplication" (
    "id" SERIAL NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "currentStudy" TEXT,
    "year12State" TEXT,
    "year12CompletionYear" INTEGER,
    "currentState" TEXT,
    "atar" DECIMAL(4,2),
    "canCommit3Hours" BOOLEAN DEFAULT false,
    "canCommit1Year" BOOLEAN DEFAULT false,
    "canTutorMostWeeks" BOOLEAN DEFAULT false,
    "canTutorGroups" BOOLEAN DEFAULT false,
    "subjectsToTutor" TEXT,
    "hasWorkingWithChildrenCheck" BOOLEAN DEFAULT false,
    "motivation" TEXT NOT NULL,
    "status" "public"."AppStatus" NOT NULL DEFAULT 'pending',
    "approvedAt" TIMESTAMP(3),
    "setupToken" TEXT,
    "setupTokenExpiry" TIMESTAMP(3),
    "files" JSONB,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SetupToken" (
    "token" TEXT NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SetupToken_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "public"."TutorProfile" (
    "userId" INTEGER NOT NULL,
    "phone_number" TEXT,
    "bio" TEXT,
    "hourly_rate" DECIMAL(10,2),
    "university" TEXT,
    "current_studies" TEXT[],
    "subjects" TEXT[],
    "subjects_selected" JSONB NOT NULL,
    "locations" TEXT[],
    "preferred_locations" TEXT[],
    "schools_attended" TEXT[],
    "is_profile_complete" BOOLEAN NOT NULL DEFAULT false,
    "documents_uploaded" BOOLEAN NOT NULL DEFAULT false,
    "is_live" BOOLEAN NOT NULL DEFAULT false,
    "tier" "public"."Tier" NOT NULL DEFAULT 'gold',
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    "atar" DECIMAL(4,2),
    "approved_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "TutorApplication_applicationId_key" ON "public"."TutorApplication"("applicationId");

-- CreateIndex
CREATE INDEX "TutorApplication_email_idx" ON "public"."TutorApplication"("email");

-- AddForeignKey
ALTER TABLE "public"."TutorApplication" ADD CONSTRAINT "TutorApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorProfile" ADD CONSTRAINT "TutorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
