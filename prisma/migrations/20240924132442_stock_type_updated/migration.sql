-- AlterTable
ALTER TABLE `stock` MODIFY `type` ENUM('entry', 'transfer', 'faulty', 'defective', 'scrap', 'fromFaulty') NOT NULL DEFAULT 'entry';
