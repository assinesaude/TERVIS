/*
  # Add subscription_plan to professionals table

  1. Changes
    - Add `subscription_plan` column to `professionals` table
      - Type: text with check constraint
      - Values: 'premium', 'professional', 'essential'
      - Default: 'essential'
    - Add index for faster filtering by plan

  2. Notes
    - This field will be updated by Stripe webhook when subscription changes
    - Used for ordering professionals in search results (premium > professional > essential)
*/

-- Add subscription_plan column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'professionals' AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE professionals 
    ADD COLUMN subscription_plan text DEFAULT 'essential' 
    CHECK (subscription_plan IN ('premium', 'professional', 'essential'));
  END IF;
END $$;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_professionals_subscription_plan 
  ON professionals(subscription_plan);