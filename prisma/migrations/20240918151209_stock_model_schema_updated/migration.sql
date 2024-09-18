-- DropForeignKey
ALTER TABLE `stock` DROP FOREIGN KEY `Stock_skuCodeId_fkey`;

-- AlterTable
ALTER TABLE `stock` MODIFY `skuCodeId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_skuCodeId_fkey` FOREIGN KEY (`skuCodeId`) REFERENCES `SkuCode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
