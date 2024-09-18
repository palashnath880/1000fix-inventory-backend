-- AlterTable
ALTER TABLE `stock` MODIFY `type` ENUM('entry', 'transfer', 'faulty', 'defective', 'scrap') NOT NULL DEFAULT 'entry';
