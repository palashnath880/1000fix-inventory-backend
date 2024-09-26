-- AlterTable
ALTER TABLE `Stock` MODIFY `type` ENUM('entry', 'transfer', 'faulty', 'defective', 'scrap', 'fromFaulty', 'faultyScrap', 'purchaseReturn') NOT NULL DEFAULT 'entry';
