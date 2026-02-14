-- AlterTable
ALTER TABLE `sessions`
  ADD COLUMN `original_started_at` DATETIME(3) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `sessions_group_id_startedAt_key` ON `sessions`(`group_id`, `startedAt`);

-- CreateIndex
CREATE INDEX `sessions_group_id_original_started_at_idx` ON `sessions`(`group_id`, `original_started_at`);
