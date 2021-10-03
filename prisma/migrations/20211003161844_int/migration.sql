/*
  Warnings:

  - The values [SUCCESS] on the enum `Transaction_transactionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Transaction` ADD COLUMN `remarks` TEXT,
    MODIFY `transactionStatus` ENUM('SUCCEEDED', 'FAILURE') NOT NULL;
