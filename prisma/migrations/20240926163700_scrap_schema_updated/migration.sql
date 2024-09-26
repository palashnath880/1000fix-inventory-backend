-- AlterTable
ALTER TABLE `Scrap` ADD COLUMN `from` ENUM('faulty', 'defective') NOT NULL DEFAULT 'faulty';
