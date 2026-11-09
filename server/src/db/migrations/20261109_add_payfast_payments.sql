CREATE TABLE IF NOT EXISTS payment_attempts (
  id UUID PRIMARY KEY,
  reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE RESTRICT,
  payment_reference UUID NOT NULL UNIQUE,
  expected_amount DECIMAL(10, 2) NOT NULL CHECK (expected_amount > 0),
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'complete', 'failed', 'cancelled')),
  payfast_payment_id VARCHAR(100) UNIQUE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS payment_attempts_reservation_created_idx
  ON payment_attempts (reservation_id, created_at DESC);

CREATE TABLE IF NOT EXISTS payment_notifications (
  id BIGSERIAL PRIMARY KEY,
  payment_attempt_id UUID NOT NULL REFERENCES payment_attempts(id) ON DELETE RESTRICT,
  payload_hash CHAR(64) NOT NULL UNIQUE,
  received_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
