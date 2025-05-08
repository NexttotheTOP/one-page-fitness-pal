-- This script fixes the constraint issue with week_schemas table
-- by allowing multiple inactive schemas while ensuring only one active schema per user

-- 1. First, drop the existing constraint that's causing the issue
ALTER TABLE IF EXISTS week_schemas
DROP CONSTRAINT IF EXISTS unique_active_schema_per_user;

-- 2. Also remove the check constraint if it exists
ALTER TABLE IF EXISTS week_schemas
DROP CONSTRAINT IF EXISTS active_schema_must_be_true;

-- 3. Add a partial unique index that only applies when is_active = TRUE
-- This allows multiple inactive schemas but prevents multiple active schemas
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_schema_per_user 
ON week_schemas (user_id) 
WHERE is_active = TRUE;

-- If you need to debug the current state of your constraints:
-- SELECT conname, contype, pg_get_constraintdef(c.oid)
-- FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid
-- WHERE t.relname = 'week_schemas'; 