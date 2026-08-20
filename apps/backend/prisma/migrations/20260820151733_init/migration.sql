-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `name` VARCHAR(100) NOT NULL,
    `name_normalized` VARCHAR(100) NOT NULL DEFAULT '',
    `password` VARCHAR(255) NULL,
    `role` ENUM('ADMIN', 'MODERATOR', 'TUTOR', 'STUDENT') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Africa/Cairo',
    `notes` TEXT NULL,

    UNIQUE INDEX `users_phone_key`(`phone`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_name_normalized_idx`(`name_normalized`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `groups` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500) NULL,
    `tutor_id` VARCHAR(191) NULL,
    `monthly_price` DECIMAL(12, 2) NULL,
    `currency` ENUM('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'CHF', 'TRY', 'SAR', 'AED', 'EGP', 'KWD', 'QAR') NULL,
    `billing_type` ENUM('FREE', 'MONTHLY') NOT NULL DEFAULT 'FREE',
    `status` ENUM('ACTIVE', 'INACTIVE', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL DEFAULT 'Africa/Cairo',

    INDEX `groups_tutor_id_idx`(`tutor_id`),
    INDEX `groups_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_schedule_days` (
    `group_id` VARCHAR(191) NOT NULL,
    `day_of_week` TINYINT UNSIGNED NOT NULL,
    `start_minutes` SMALLINT UNSIGNED NOT NULL,
    `duration_minutes` SMALLINT UNSIGNED NOT NULL,

    PRIMARY KEY (`group_id`, `day_of_week`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_students` (
    `group_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `left_at` DATETIME(3) NULL,

    INDEX `group_students_user_id_idx`(`user_id`),
    INDEX `group_students_left_at_idx`(`left_at`),
    PRIMARY KEY (`group_id`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `group_id` VARCHAR(191) NOT NULL,
    `tutor_id` VARCHAR(191) NOT NULL,
    `startedAt` DATETIME(3) NOT NULL,
    `original_started_at` DATETIME(3) NULL,
    `status` ENUM('RESCHEDULED', 'COMPLETED', 'CANCELED', 'MISSED') NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `sessions_group_id_idx`(`group_id`),
    INDEX `sessions_tutor_id_idx`(`tutor_id`),
    INDEX `sessions_startedAt_idx`(`startedAt`),
    INDEX `sessions_group_id_original_started_at_idx`(`group_id`, `original_started_at`),
    INDEX `sessions_status_idx`(`status`),
    UNIQUE INDEX `sessions_group_id_startedAt_key`(`group_id`, `startedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaction_labels` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `name_normalized` VARCHAR(100) NOT NULL DEFAULT '',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `transaction_labels_name_normalized_idx`(`name_normalized`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `financial_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('INCOME', 'EXPENSE') NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `currency` ENUM('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'CHF', 'TRY', 'SAR', 'AED', 'EGP', 'KWD', 'QAR') NOT NULL,
    `entity_type` ENUM('LEARNER_PAYMENT', 'MANUAL') NOT NULL,
    `label_id` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `learner_payment_id` VARCHAR(191) NULL,
    `created_by_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `financial_transactions_type_idx`(`type`),
    INDEX `financial_transactions_entity_type_idx`(`entity_type`),
    INDEX `financial_transactions_label_id_idx`(`label_id`),
    INDEX `financial_transactions_created_by_id_idx`(`created_by_id`),
    INDEX `financial_transactions_created_at_idx`(`created_at`),
    INDEX `financial_transactions_learner_payment_id_idx`(`learner_payment_id`),
    INDEX `financial_transactions_entity_type_learner_payment_id_idx`(`entity_type`, `learner_payment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `learner_payments` (
    `id` VARCHAR(191) NOT NULL,
    `learner_id` VARCHAR(191) NOT NULL,
    `group_id` VARCHAR(191) NOT NULL,
    `period_from` DATETIME(3) NOT NULL,
    `period_to` DATETIME(3) NOT NULL,
    `total_amount` DECIMAL(12, 2) NOT NULL,
    `currency` ENUM('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'CHF', 'TRY', 'SAR', 'AED', 'EGP', 'KWD', 'QAR') NOT NULL,
    `status` ENUM('UNPAID', 'PAID') NOT NULL DEFAULT 'UNPAID',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `learner_payments_learner_id_idx`(`learner_id`),
    INDEX `learner_payments_group_id_idx`(`group_id`),
    INDEX `learner_payments_status_idx`(`status`),
    INDEX `learner_payments_period_from_idx`(`period_from`),
    INDEX `learner_payments_period_to_idx`(`period_to`),
    INDEX `learner_payments_learner_id_period_from_period_to_idx`(`learner_id`, `period_from`, `period_to`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendance_records` (
    `id` VARCHAR(191) NOT NULL,
    `session_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `status` ENUM('ATTENDED', 'MISSED', 'EXCUSED') NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `attendance_records_user_id_idx`(`user_id`),
    INDEX `attendance_records_status_idx`(`status`),
    UNIQUE INDEX `attendance_records_session_id_user_id_key`(`session_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `groups` ADD CONSTRAINT `groups_tutor_id_fkey` FOREIGN KEY (`tutor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_schedule_days` ADD CONSTRAINT `group_schedule_days_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_students` ADD CONSTRAINT `group_students_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_students` ADD CONSTRAINT `group_students_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_tutor_id_fkey` FOREIGN KEY (`tutor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial_transactions` ADD CONSTRAINT `financial_transactions_label_id_fkey` FOREIGN KEY (`label_id`) REFERENCES `transaction_labels`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial_transactions` ADD CONSTRAINT `financial_transactions_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `financial_transactions` ADD CONSTRAINT `financial_transactions_learner_payment_id_fkey` FOREIGN KEY (`learner_payment_id`) REFERENCES `learner_payments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `learner_payments` ADD CONSTRAINT `learner_payments_learner_id_fkey` FOREIGN KEY (`learner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `learner_payments` ADD CONSTRAINT `learner_payments_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_records` ADD CONSTRAINT `attendance_records_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendance_records` ADD CONSTRAINT `attendance_records_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
