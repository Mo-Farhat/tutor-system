-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "curriculum" TEXT NOT NULL,
    "yearLevel" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Subject_curriculum_yearLevel_idx" ON "Subject"("curriculum", "yearLevel");

-- CreateIndex
CREATE INDEX "Subject_isActive_idx" ON "Subject"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_curriculum_yearLevel_key" ON "Subject"("name", "curriculum", "yearLevel");
