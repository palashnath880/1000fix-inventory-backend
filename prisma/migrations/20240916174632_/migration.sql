/*
  Warnings:

  - The values [return] on the enum `Stock_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `stock` MODIFY `type` ENUM('entry', 'transfer', 'faulty', 'defective') NOT NULL DEFAULT 'entry';
