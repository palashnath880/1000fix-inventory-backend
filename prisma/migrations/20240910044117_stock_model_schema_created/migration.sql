-- CreateTable
CREATE TABLE `Stock` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('entry', 'transfer', 'engineer', 'return', 'defective') NOT NULL,
    `status` ENUM('open', 'approved', 'received', 'rejected', 'returned') NOT NULL DEFAULT 'open',
    `price` DOUBLE NULL DEFAULT 0,
    `quantity` DOUBLE NULL DEFAULT 0,
    `rackNo` VARCHAR(191) NULL,
    `note` VARCHAR(191) NULL,
    `challan` VARCHAR(191) NULL,
    `senderId` VARCHAR(191) NULL,
    `receiverId` VARCHAR(191) NULL,
    `skuCodeId` VARCHAR(191) NOT NULL,
    `endAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `Branch`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_skuCodeId_fkey` FOREIGN KEY (`skuCodeId`) REFERENCES `SkuCode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
