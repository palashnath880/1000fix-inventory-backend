/*
  Warnings:

  - The values [scrap] on the enum `StockItem_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `stockitem` MODIFY `type` ENUM('defective', 'faulty') NOT NULL;
