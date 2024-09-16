/*
  Warnings:

  - The values [engineer] on the enum `Stock_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `stock` MODIFY `type` ENUM('entry', 'transfer', 'return', 'defective') NOT NULL DEFAULT 'entry';

-- CreateTable
CREATE TABLE `EngineerStock` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('open', 'approved', 'received', 'rejected', 'returned') NOT NULL DEFAULT 'open',
    `type` ENUM('transfer', 'return', 'faulty') NOT NULL DEFAULT 'transfer',
    `price` DOUBLE NULL DEFAULT 0,
    `quantity` DOUBLE NULL DEFAULT 0,
    `note` VARCHAR(191) NULL,
    `branchId` VARCHAR(191) NOT NULL,
    `engineerId` VARCHAR(191) NOT NULL,
    `skuCodeId` VARCHAR(191) NOT NULL,
    `endAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EngineerStock` ADD CONSTRAINT `EngineerStock_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EngineerStock` ADD CONSTRAINT `EngineerStock_engineerId_fkey` FOREIGN KEY (`engineerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EngineerStock` ADD CONSTRAINT `EngineerStock_skuCodeId_fkey` FOREIGN KEY (`skuCodeId`) REFERENCES `SkuCode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
