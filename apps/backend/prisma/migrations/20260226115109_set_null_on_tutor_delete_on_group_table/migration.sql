-- DropForeignKey
ALTER TABLE `groups` DROP FOREIGN KEY `groups_tutor_id_fkey`;

-- AlterTable
ALTER TABLE `groups` MODIFY `tutor_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `groups` ADD CONSTRAINT `groups_tutor_id_fkey` FOREIGN KEY (`tutor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
