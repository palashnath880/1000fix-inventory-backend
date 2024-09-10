/*
  Warnings:

  - Added the required column `isDefective` to the `SkuCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `skucode` ADD COLUMN `isDefective` BOOLEAN NOT NULL;
