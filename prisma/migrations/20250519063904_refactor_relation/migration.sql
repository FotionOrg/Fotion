/*
  Warnings:

  - You are about to drop the column `projectId` on the `NotionIntegartion` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "NotionIntegartion_projectId_idx";

-- AlterTable
ALTER TABLE "NotionIntegartion" DROP COLUMN "projectId";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "notionIntegrationId" TEXT;
