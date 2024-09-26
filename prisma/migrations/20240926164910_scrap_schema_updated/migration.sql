/*
  Warnings:

  - Added the required column `branchId` to the `Scrap` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Scrap` ADD COLUMN `branchId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Scrap` ADD CONSTRAINT `Scrap_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
