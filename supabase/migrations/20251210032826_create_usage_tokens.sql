/*
  # Create usage_tokens table for rate limiting

  1. New Tables
    - `usage_tokens`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References auth.users
      - `date` (date) - Date of usage (YYYY-MM-DD)
      - `tokens_used` (integer) - Number of tokens used on this date
      - Unique constraint on (user_id, date) to prevent duplicates

  2. Security
    - Enable RLS on `usage_tokens` table
    - Add policy for authenticated users to read their own usage data
    - Service role can read/write all data (for edge functions)

  3. Indexes
    - Index on (user_id, date) for fast lookups
*/

-- Create usage_tokens table
CREATE TABLE IF NOT EXISTS usage_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  tokens_used integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT usage_tokens_user_date_unique UNIQUE (user_id, date)
);

-- Enable RLS
ALTER TABLE usage_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own usage data
CREATE POLICY "Users can read own usage data"
  ON usage_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_usage_tokens_user_date
  ON usage_tokens(user_id, date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_usage_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_usage_tokens_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_usage_tokens_updated_at_trigger
      BEFORE UPDATE ON usage_tokens
      FOR EACH ROW
      EXECUTE FUNCTION update_usage_tokens_updated_at();
  END IF;
END $$;
