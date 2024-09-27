/*
  Warnings:

  - A unique constraint covering the columns `[isHead]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isHead` to the `Branch` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `branch` ADD COLUMN `isHead` BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Branch_isHead_key` ON `Branch`(`isHead`);
