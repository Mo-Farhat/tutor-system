-- AlterTable
ALTER TABLE "public"."StudentProfile" ADD COLUMN     "additional_notes" TEXT,
ADD COLUMN     "best_time" TEXT,
ADD COLUMN     "learning_style" TEXT[],
ADD COLUMN     "session_length" TEXT;
