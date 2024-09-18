-- CreateTable
CREATE TABLE `ScrapItem` (
    `id` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NULL DEFAULT 0,
    `challanId` VARCHAR(191) NOT NULL,
    `skuCodeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ScrapItem` ADD CONSTRAINT `ScrapItem_challanId_fkey` FOREIGN KEY (`challanId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ScrapItem` ADD CONSTRAINT `ScrapItem_skuCodeId_fkey` FOREIGN KEY (`skuCodeId`) REFERENCES `SkuCode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
