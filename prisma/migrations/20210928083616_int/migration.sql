/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Profile` DROP COLUMN `stripeCustomerId`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `stripeCustomerId` VARCHAR(191);
