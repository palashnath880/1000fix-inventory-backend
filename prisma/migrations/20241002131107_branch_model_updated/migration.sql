-- AlterTable
ALTER TABLE `branch` ADD COLUMN `parentId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Branch` ADD CONSTRAINT `Branch_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;