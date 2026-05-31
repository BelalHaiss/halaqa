/*
  Warnings:

  - You are about to drop the `learner_payment_groups` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `billing_type` to the `learner_payments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `learner_payment_groups` DROP FOREIGN KEY `learner_payment_groups_group_id_fkey`;

-- DropForeignKey
ALTER TABLE `learner_payment_groups` DROP FOREIGN KEY `learner_payment_groups_learner_payment_id_fkey`;

-- AlterTable: add with default, backfill existing rows, then drop the default
ALTER TABLE `learner_payments` ADD COLUMN `billing_type` ENUM('SESSION_COUNT_MONTHLY') NOT NULL DEFAULT 'SESSION_COUNT_MONTHLY';
ALTER TABLE `learner_payments` ALTER COLUMN `billing_type` DROP DEFAULT;

-- DropTable
DROP TABLE `learner_payment_groups`;

-- CreateIndex
CREATE INDEX `learner_payments_billing_type_idx` ON `learner_payments`(`billing_type`);
