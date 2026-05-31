-- Make billing rate fields on groups nullable (FREE groups have no rate)
ALTER TABLE `groups`
    MODIFY `tutor_hourly_rate` DECIMAL(12, 2) NULL,
    MODIFY `tutor_currency` ENUM('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'CHF', 'TRY', 'SAR', 'AED', 'EGP', 'KWD', 'QAR') NULL;

-- Make billing snapshot fields on sessions nullable (FREE group sessions have no price)
ALTER TABLE `sessions`
    MODIFY `tutor_session_price` DECIMAL(12, 2) NULL,
    MODIFY `tutor_currency` ENUM('USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'CAD', 'AUD', 'CHF', 'TRY', 'SAR', 'AED', 'EGP', 'KWD', 'QAR') NULL;

-- Clear the placeholder defaults that were set for FREE groups
UPDATE `groups`
SET `tutor_hourly_rate` = NULL, `tutor_currency` = NULL
WHERE `billing_type` = 'FREE';

-- Clear the placeholder snapshots for sessions belonging to FREE groups
UPDATE `sessions` s
JOIN `groups` g ON g.`id` = s.`group_id`
SET s.`tutor_session_price` = NULL, s.`tutor_currency` = NULL
WHERE g.`billing_type` = 'FREE';
