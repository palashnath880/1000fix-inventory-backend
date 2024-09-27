/*
  Warnings:

  - Added the required column `isHead` to the `Branch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `branch` ADD COLUMN `isHead` BOOLEAN NOT NULL;
