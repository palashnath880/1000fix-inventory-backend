/*
  Warnings:

  - The values [scrap,faultyScrap] on the enum `Stock_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Stock` MODIFY COLUMN `type` ENUM('entry', 'transfer', 'faulty', 'defective', 'fromFaulty', 'purchaseReturn') NOT NULL DEFAULT 'entry';

-- CreateTable
CREATE TABLE `Scrap` (
    `id` VARCHAR(191) NOT NULL,
    `challanNo` VARCHAR(191) NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Scrap_challanNo_key`(`challanNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ScrapItem` (
    `id` VARCHAR(191) NOT NULL,
    `skuCodeId` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `scrapId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScrapItem` ADD CONSTRAINT `ScrapItem_skuCodeId_fkey` FOREIGN KEY (`skuCodeId`) REFERENCES `SkuCode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScrapItem` ADD CONSTRAINT `ScrapItem_scrapId_fkey` FOREIGN KEY (`scrapId`) REFERENCES `Scrap`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
