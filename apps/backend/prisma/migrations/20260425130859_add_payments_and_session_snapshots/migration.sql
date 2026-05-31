-- AlterTable
ALTER TABLE `group_students` ADD COLUMN `left_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `groups` ADD COLUMN `billing_type` ENUM('FREE', 'SESSION_COUNT_MONTHLY') NOT NULL DEFAULT 'FREE',
    ADD COLUMN `tutor_currency` ENUM('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'CHF', 'TRY', 'SAR', 'AED', 'EGP', 'KWD', 'QAR') NOT NULL DEFAULT 'EGP',
    ADD COLUMN `tutor_hourly_rate` DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `sessions` ADD COLUMN `tutor_currency` ENUM('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'CHF', 'TRY', 'SAR', 'AED', 'EGP', 'KWD', 'QAR') NOT NULL DEFAULT 'EGP',
        ADD COLUMN `tutor_id` VARCHAR(191) NULL,
    ADD COLUMN `tutor_session_price` DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- Backfill snapshot fields for existing sessions from the related group
UPDATE `sessions` s
JOIN `groups` g ON g.`id` = s.`group_id`
SET
    s.`tutor_id` = g.`tutor_id`,
    s.`tutor_session_price` = g.`tutor_hourly_rate`,
    s.`tutor_currency` = g.`tutor_currency`;

-- Enforce required tutor snapshot after backfill
ALTER TABLE `sessions` MODIFY `tutor_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `financial_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('INCOME', 'EXPENSE') NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `currency` ENUM('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'CHF', 'TRY', 'SAR', 'AED', 'EGP', 'KWD', 'QAR') NOT NULL,
    `entity_type` ENUM('LEARNER_PAYMENT', 'TUTOR_PAYMENT') NOT NULL,
    `learner_payment_id` VARCHAR(191) NULL,
    `tutor_payment_id` VARCHAR(191) NULL,
    `created_by_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `financial_transactions_type_idx`(`type`),
    INDEX `financial_transactions_entity_type_idx`(`entity_type`),
    INDEX `financial_transactions_created_by_id_idx`(`created_by_id`),
    INDEX `financial_transactions_created_at_idx`(`created_at`),
    INDEX `financial_transactions_learner_payment_id_idx`(`learner_payment_id`),
    INDEX `financial_transactions_tutor_payment_id_idx`(`tutor_payment_id`),
    INDEX `financial_transactions_entity_type_learner_payment_id_idx`(`entity_type`, `learner_payment_id`),
    INDEX `financial_transactions_entity_type_tutor_payment_id_idx`(`entity_type`, `tutor_payment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `learner_payments` (
    `id` VARCHAR(191) NOT NULL,
    `learner_id` VARCHAR(191) NOT NULL,
    `sessions_count` SMALLINT UNSIGNED NOT NULL,
    `period_from` DATETIME(3) NOT NULL,
    `period_to` DATETIME(3) NOT NULL,
    `total_amount` DECIMAL(12, 2) NOT NULL,
    `paid_amount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `currency` ENUM('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'CHF', 'TRY', 'SAR', 'AED', 'EGP', 'KWD', 'QAR') NOT NULL,
    `status` ENUM('UNPAID', 'PARTIAL', 'PAID') NOT NULL DEFAULT 'UNPAID',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `learner_payments_learner_id_idx`(`learner_id`),
    INDEX `learner_payments_status_idx`(`status`),
    INDEX `learner_payments_period_from_idx`(`period_from`),
    INDEX `learner_payments_period_to_idx`(`period_to`),
    INDEX `learner_payments_learner_id_period_from_period_to_idx`(`learner_id`, `period_from`, `period_to`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `learner_payment_groups` (
    `learner_payment_id` VARCHAR(191) NOT NULL,
    `group_id` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `learner_payment_groups_group_id_idx`(`group_id`),
    INDEX `learner_payment_groups_is_active_idx`(`is_active`),
    PRIMARY KEY (`learner_payment_id`, `group_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tutor_payments` (
    `id` VARCHAR(191) NOT NULL,
    `tutor_id` VARCHAR(191) NOT NULL,
    `period_from` DATETIME(3) NOT NULL,
    `period_to` DATETIME(3) NOT NULL,
    `sessions_count` SMALLINT UNSIGNED NOT NULL,
    `total_amount` DECIMAL(12, 2) NOT NULL,
    `currency` ENUM('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'CHF', 'TRY', 'SAR', 'AED', 'EGP', 'KWD', 'QAR') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `tutor_payments_tutor_id_idx`(`tutor_id`),
    INDEX `tutor_payments_period_from_idx`(`period_from`),
    INDEX `tutor_payments_period_to_idx`(`period_to`),
    INDEX `tutor_payments_tutor_id_period_from_period_to_idx`(`tutor_id`, `period_from`, `period_to`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `group_students_left_at_idx` ON `group_students`(`left_at`);

-- CreateIndex
CREATE INDEX `sessions_tutor_id_idx` ON `sessions`(`tutor_id`);

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_tutor_id_fkey` FOREIGN KEY (`tutor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial_transactions` ADD CONSTRAINT `financial_transactions_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial_transactions` ADD CONSTRAINT `financial_transactions_learner_payment_id_fkey` FOREIGN KEY (`learner_payment_id`) REFERENCES `learner_payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial_transactions` ADD CONSTRAINT `financial_transactions_tutor_payment_id_fkey` FOREIGN KEY (`tutor_payment_id`) REFERENCES `tutor_payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `learner_payments` ADD CONSTRAINT `learner_payments_learner_id_fkey` FOREIGN KEY (`learner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `learner_payment_groups` ADD CONSTRAINT `learner_payment_groups_learner_payment_id_fkey` FOREIGN KEY (`learner_payment_id`) REFERENCES `learner_payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `learner_payment_groups` ADD CONSTRAINT `learner_payment_groups_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tutor_payments` ADD CONSTRAINT `tutor_payments_tutor_id_fkey` FOREIGN KEY (`tutor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
