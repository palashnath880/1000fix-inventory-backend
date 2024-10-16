/*
  Warnings:

  - Made the column `quantity` on table `faulty` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `faulty` MODIFY `quantity` DOUBLE NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Uom` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Uom_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
