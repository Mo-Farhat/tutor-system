-- CreateTable
CREATE TABLE "public"."StudentProfile" (
    "userId" INTEGER NOT NULL,
    "phone_number" TEXT,
    "bio" TEXT,
    "current_school" TEXT,
    "year_level" TEXT,
    "subjects_interested" TEXT[],
    "preferred_locations" TEXT[],
    "learning_goals" TEXT,
    "is_profile_complete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentProfile_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "public"."StudentProfile" ADD CONSTRAINT "StudentProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
