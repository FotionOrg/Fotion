-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "linearIntegrationId" TEXT;

-- CreateTable
CREATE TABLE "LinearIntegration" (
    "id" UUID NOT NULL,
    "accessToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinearIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LinearIntegration_userId_key" ON "LinearIntegration"("userId");

-- CreateIndex
CREATE INDEX "LinearIntegration_userId_idx" ON "LinearIntegration"("userId");
