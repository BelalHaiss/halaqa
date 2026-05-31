-- DropIndex
DROP INDEX `learner_payments_billing_type_idx` ON `learner_payments`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `name_normalized` VARCHAR(100) NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX `users_name_normalized_idx` ON `users`(`name_normalized`);
