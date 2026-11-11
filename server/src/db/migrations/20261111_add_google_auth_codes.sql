CREATE TABLE google_auth_codes (
  code_hash CHAR(64) PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX google_auth_codes_expires_at_idx
  ON google_auth_codes (expires_at);
