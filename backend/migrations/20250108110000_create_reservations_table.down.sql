-- Drop trigger
DROP TRIGGER IF EXISTS trigger_update_reservations_updated_at ON reservations;

-- Drop function
DROP FUNCTION IF EXISTS update_reservations_updated_at();

-- Drop indexes
DROP INDEX IF EXISTS idx_reservations_created_at;
DROP INDEX IF EXISTS idx_reservations_email;
DROP INDEX IF EXISTS idx_reservations_date;
DROP INDEX IF EXISTS idx_reservations_status;

-- Drop table
DROP TABLE IF EXISTS reservations;
