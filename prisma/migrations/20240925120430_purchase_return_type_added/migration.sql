-- AlterTable
ALTER TABLE `stock` MODIFY `type` ENUM('entry', 'transfer', 'faulty', 'defective', 'scrap', 'fromFaulty', 'purchaseReturn') NOT NULL DEFAULT 'entry';
