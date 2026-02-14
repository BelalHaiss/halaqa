/*
  Warnings:

  - You are about to alter the column `status` on the `sessions` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `sessions` MODIFY `status` ENUM('RESCHEDULED', 'COMPLETED', 'CANCELED', 'MISSED') NOT NULL;

-- AddForeignKey
ALTER TABLE `groups` ADD CONSTRAINT `groups_tutor_id_fkey` FOREIGN KEY (`tutor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
