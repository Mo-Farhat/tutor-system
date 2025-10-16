-- CreateTable
CREATE TABLE "public"."TutorRequest" (
    "id" SERIAL NOT NULL,
    "tutorId" INTEGER NOT NULL,
    "studentId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TutorRequest_tutorId_studentId_status_idx" ON "public"."TutorRequest"("tutorId", "studentId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TutorRequest_studentId_tutorId_key" ON "public"."TutorRequest"("studentId", "tutorId");

-- AddForeignKey
ALTER TABLE "public"."TutorRequest" ADD CONSTRAINT "TutorRequest_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TutorRequest" ADD CONSTRAINT "TutorRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
