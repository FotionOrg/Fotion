/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `NotionIntegartion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "NotionIntegartion_userId_key" ON "NotionIntegartion"("userId");
