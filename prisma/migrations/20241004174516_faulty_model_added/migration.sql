/*
  Warnings:

  - The values [faulty] on the enum `Stock_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `stock` MODIFY `type` ENUM('entry', 'transfer', 'defective', 'fromFaulty', 'purchaseReturn') NOT NULL DEFAULT 'entry';

-- CreateTable
CREATE TABLE `Faulty` (
    `id` VARCHAR(191) NOT NULL,
    `fromCSC` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('open', 'approved', 'received', 'rejected', 'returned') NOT NULL DEFAULT 'open',
    `quantity` DOUBLE NULL DEFAULT 0,
    `reason` VARCHAR(191) NULL,
    `endReason` VARCHAR(191) NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `skuCodeId` VARCHAR(191) NULL,
    `endAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Faulty` ADD CONSTRAINT `Faulty_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Faulty` ADD CONSTRAINT `Faulty_skuCodeId_fkey` FOREIGN KEY (`skuCodeId`) REFERENCES `SkuCode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
