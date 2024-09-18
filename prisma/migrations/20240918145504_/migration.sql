/*
  Warnings:

  - A unique constraint covering the columns `[challan]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Stock_challan_key` ON `Stock`(`challan`);
