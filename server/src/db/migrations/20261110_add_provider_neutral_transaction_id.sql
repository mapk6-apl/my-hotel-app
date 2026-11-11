ALTER TABLE payment_attempts
ADD COLUMN payment_provider VARCHAR(20);

ALTER TABLE payment_attempts
ADD COLUMN provider_transaction_id VARCHAR(100);

-- Preserve the existing PayFast payment information.
-- Existing payment attempts were created under PayFast.
UPDATE payment_attempts
SET
  payment_provider = 'payfast',
  provider_transaction_id = payfast_payment_id
WHERE payment_provider IS NULL;

-- New payment attempts will use Paystack by default.
ALTER TABLE payment_attempts
ALTER COLUMN payment_provider SET DEFAULT 'paystack';

ALTER TABLE payment_attempts
ALTER COLUMN payment_provider SET NOT NULL;

ALTER TABLE payment_attempts
ADD CONSTRAINT payment_attempts_payment_provider_check
CHECK (payment_provider IN ('payfast', 'paystack'));

-- Prevent duplicate transaction IDs for the same provider.
CREATE UNIQUE INDEX payment_attempts_provider_transaction_unique_idx
ON payment_attempts (payment_provider, provider_transaction_id)
WHERE provider_transaction_id IS NOT NULL;
