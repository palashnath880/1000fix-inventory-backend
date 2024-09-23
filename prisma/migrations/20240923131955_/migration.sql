/*
  Warnings:

  - A unique constraint covering the columns `[challanNo]` on the table `Challan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `challanNo` to the `Challan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `challan` ADD COLUMN `challanNo` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Challan_challanNo_key` ON `Challan`(`challanNo`);
