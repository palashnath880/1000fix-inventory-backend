-- AlterTable
ALTER TABLE `stock` MODIFY `type` ENUM('entry', 'transfer', 'engineer', 'return', 'defective') NOT NULL DEFAULT 'entry';
