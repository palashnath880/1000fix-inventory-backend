/*
  Warnings:

  - A unique constraint covering the columns `[itemId]` on the table `SkuCode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `SkuCode_itemId_key` ON `SkuCode`(`itemId`);
