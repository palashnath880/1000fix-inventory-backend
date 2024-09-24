-- AlterTable
ALTER TABLE `Stock` MODIFY `type` ENUM('entry', 'transfer', 'faulty', 'defective', 'scrap', 'fromFaulty') NOT NULL DEFAULT 'entry';
