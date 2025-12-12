/*
  # Create token_usage_logs table for audit trail

  1. New Tables
    - `token_usage_logs`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References auth.users
      - `tokens_consumed` (integer) - Number of tokens consumed (0 for free categories)
      - `category` (text) - Category of the question (bulario, general, exam_analysis, etc)
      - `question_preview` (text, optional) - First 100 chars of question for audit
      - `created_at` (timestamptz) - Timestamp of the request

  2. Security
    - Enable RLS on `token_usage_logs` table
    - Add policy for authenticated users to read their own logs
    - Service role can read/write all data (for edge functions)

  3. Indexes
    - Index on (user_id, created_at) for fast lookups
    - Index on category for analytics
*/

-- Create token_usage_logs table
CREATE TABLE IF NOT EXISTS token_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tokens_consumed integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'general',
  question_preview text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE token_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own logs
CREATE POLICY "Users can read own logs"
  ON token_usage_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_usage_logs_user_date
  ON token_usage_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_token_usage_logs_category
  ON token_usage_logs(category);

-- Add check constraint for valid categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'token_usage_logs_category_check'
  ) THEN
    ALTER TABLE token_usage_logs
      ADD CONSTRAINT token_usage_logs_category_check
      CHECK (category IN ('bulario', 'general', 'exam_analysis', 'symptom_check', 'prescription_reading', 'other'));
  END IF;
END $$;
