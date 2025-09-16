-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('bank_transfer', 'paypal');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('contract', 'wwcc');

-- AlterTable
ALTER TABLE "public"."TutorProfile" ADD COLUMN     "intro_video_path" TEXT;

-- CreateTable
CREATE TABLE "public"."TutorPaymentInfo" (
    "userId" INTEGER NOT NULL,
    "abnNumber" TEXT,
    "paymentMethod" "public"."PaymentMethod",
    "accountName" TEXT,
    "bsb" TEXT,
    "accountNumber" TEXT,
    "paypalEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorPaymentInfo_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."TutorDocument" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" "public"."DocumentType" NOT NULL,
    "path" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TutorDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "doc_user_type" ON "public"."TutorDocument"("userId", "type");

-- CreateIndex
CREATE INDEX "TutorApplication_status_createdAt_idx" ON "public"."TutorApplication"("status", "createdAt");

-- CreateIndex
CREATE INDEX "User_role_createdAt_idx" ON "public"."User"("role", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."TutorPaymentInfo" ADD CONSTRAINT "TutorPaymentInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorDocument" ADD CONSTRAINT "TutorDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
