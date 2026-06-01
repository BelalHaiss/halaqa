-- AlterTable
ALTER TABLE `financial_transactions` ADD COLUMN `label_id` VARCHAR(191) NULL,
    ADD COLUMN `notes` TEXT NULL,
    MODIFY `entity_type` ENUM('LEARNER_PAYMENT', 'TUTOR_PAYMENT', 'MANUAL') NOT NULL;

-- CreateTable
CREATE TABLE `transaction_labels` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `name_normalized` VARCHAR(100) NOT NULL DEFAULT '',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `transaction_labels_name_normalized_idx`(`name_normalized`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `financial_transactions_label_id_idx` ON `financial_transactions`(`label_id`);

-- AddForeignKey
ALTER TABLE `financial_transactions` ADD CONSTRAINT `financial_transactions_label_id_fkey` FOREIGN KEY (`label_id`) REFERENCES `transaction_labels`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
