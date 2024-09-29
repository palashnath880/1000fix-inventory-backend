-- AlterTable
ALTER TABLE `engineerstock` MODIFY `type` ENUM('transfer', 'return', 'faulty', 'defective') NOT NULL DEFAULT 'transfer';
