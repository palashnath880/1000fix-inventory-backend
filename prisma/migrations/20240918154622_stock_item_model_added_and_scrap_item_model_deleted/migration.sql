/*
  Warnings:

  - You are about to drop the `scrapitem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `scrapitem` DROP FOREIGN KEY `ScrapItem_challanId_fkey`;

-- DropForeignKey
ALTER TABLE `scrapitem` DROP FOREIGN KEY `ScrapItem_skuCodeId_fkey`;

-- DropTable
DROP TABLE `scrapitem`;

-- CreateTable
CREATE TABLE `StockItem` (
    `id` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL DEFAULT 0,
    `type` ENUM('defective', 'scrap') NOT NULL,
    `challanId` VARCHAR(191) NOT NULL,
    `skuCodeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StockItem` ADD CONSTRAINT `StockItem_challanId_fkey` FOREIGN KEY (`challanId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StockItem` ADD CONSTRAINT `StockItem_skuCodeId_fkey` FOREIGN KEY (`skuCodeId`) REFERENCES `SkuCode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
