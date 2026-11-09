# Break-Away Hotels deployment preparation

## Render backend and PostgreSQL

The Render Blueprint creates a PostgreSQL database and an Express service. It is not deployed from this workspace. The database starts empty: the production migrations create tables and indexes but do not copy hotel, room, amenity, user, booking, or image records.

Before using the Blueprint, confirm the database and service plans in the Render account. Set `CLIENT_URL` to the exact HTTPS Vercel frontend origin (or comma-separated allowed origins), and set `GOOGLE_CALLBACK_URL` to the deployed backend's `/api/auth/google/callback` URL. Add that callback URL to the Google OAuth client. Set the Vercel build variable `VITE_API_BASE_URL` to the deployed backend URL ending in `/api`; it is not a secret.

Render's `DATABASE_URL` must be its private PostgreSQL connection string. The service listens on Render's `PORT`, binds to `0.0.0.0`, checks PostgreSQL at `/health`, and closes the pool on shutdown.

## Required backend environment

Configure these only in the backend service's secret environment:

- `DATABASE_URL`
- `JWT_SECRET` (at least 32 characters)
- `CLIENT_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `UNSPLASH_ACCESS_KEY`
- `PAYFAST_MODE=sandbox`
- `PAYFAST_MERCHANT_ID`
- `PAYFAST_MERCHANT_KEY`
- `PAYFAST_PASSPHRASE`
- `PAYFAST_RETURN_URL`
- `PAYFAST_CANCEL_URL`
- `PAYFAST_NOTIFY_URL`
- `PAYFAST_SOURCE_IPS`
- Render supplies `PORT`.

The PayFast return and cancel URLs must be HTTPS frontend URLs. `PAYFAST_NOTIFY_URL` must be a publicly reachable HTTPS backend URL ending in `/api/bookings/payfast/notify`. Populate `PAYFAST_SOURCE_IPS` only with the current source addresses/ranges published by PayFast; do not use guessed or stale values. The code refuses to start in production unless the required configuration is present and `PAYFAST_MODE` is `sandbox`.

PayFast Standard Payments requires a merchant identifier and merchant key in its browser-posted form. The values are read from backend environment variables and are not compiled into Vite assets; the passphrase and Unsplash access key remain server-only. Break-Away Hotels does not collect card details.

## Safe database preparation and data transfer

1. Back up the target Render database before each production migration or import.
2. Build the server with `npm run build:server`. The deploy start command runs `npm run migrate:prod` before starting the API.
3. `migrate:prod` applies the additive SQL files under `server/src/db/migrations` using a migration ledger and PostgreSQL advisory lock. It is safe to rerun. Never run `server/src/db/schema.sql` or `runSeed.ts` against production; the schema script drops tables.
4. The migrations do not transfer local data. Before opening the service to users, make an encrypted, access-controlled export of the approved source records and load it into the migrated target in foreign-key order: amenities, accommodations, users, rooms, images, accommodation/amenity links, reservations, reviews, and favourites. Do not copy local `.env` values, database credentials, or the migration ledger. Preserve record IDs, synchronize PostgreSQL sequences, and verify row counts, relationships, and reservation totals before cutover. User records contain personal data and require explicit authorization for transfer.
5. Take and verify another backup after the import. Do not replace an existing target database with a local snapshot.

## Current image and payment test limits

The local cleanup retained six relevant Unsplash records across three properties; the other properties use a hotel-name-specific placeholder until additional relevant photos are imported. The imported URLs are direct Unsplash URLs, with photo/photographer attribution and download tracking. Unsplash currently reports its rate limit, so this workspace has not completed five-photo galleries for all fourteen properties. After the quota resets, use the authenticated admin image-import endpoint; it filters image dimensions and accommodation metadata and does not download/rehost photos.

PayFast notifications are accepted only from configured source IPs, checked with PayFast's validation endpoint, matched to a pending payment reference and exact amount, and processed idempotently. Only a verified `COMPLETE` notification changes a reservation to paid/confirmed. A customer return or cancel redirect never confirms payment. Localhost cannot receive PayFast ITNs; sandbox end-to-end testing requires the deployed HTTPS staging notify URL.
