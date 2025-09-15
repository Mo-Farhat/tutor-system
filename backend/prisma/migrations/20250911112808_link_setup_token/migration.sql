/*
  Warnings:

  - A unique constraint covering the columns `[applicationId]` on the table `SetupToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SetupToken_applicationId_key" ON "public"."SetupToken"("applicationId");

-- CreateIndex
CREATE INDEX "SetupToken_applicationId_idx" ON "public"."SetupToken"("applicationId");

-- AddForeignKey
ALTER TABLE "public"."SetupToken" ADD CONSTRAINT "SetupToken_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."TutorApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
