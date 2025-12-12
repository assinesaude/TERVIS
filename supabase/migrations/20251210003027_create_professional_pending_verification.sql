/*
  # Create professional_pending_verification table

  1. New Tables
    - `professional_pending_verification`
      - `id` (uuid, primary key) - Unique identifier for each verification request
      - `user_id` (uuid, FK to auth.users) - Reference to the user requesting verification
      - `full_name` (text, not null) - Full name of the professional
      - `cpf` (text, not null) - CPF document number
      - `document_url` (text) - URL to uploaded verification document
      - `specialty` (text) - Medical or health specialty
      - `created_at` (timestamptz) - When the verification request was created
      - `status` (text) - Verification status: 'pending', 'approved', 'rejected'

  2. Security
    - Enable RLS on `professional_pending_verification` table
    - Add policy for authenticated users to insert their own verification requests
    - Add policy for authenticated users to view their own verification requests
    - Only admin users can update verification status (to be implemented separately)
*/

-- Create professional_pending_verification table
CREATE TABLE IF NOT EXISTS professional_pending_verification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  cpf text NOT NULL,
  document_url text,
  specialty text,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Enable RLS
ALTER TABLE professional_pending_verification ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own verification requests
CREATE POLICY "Users can create own verification request"
  ON professional_pending_verification
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own verification requests
CREATE POLICY "Users can view own verification request"
  ON professional_pending_verification
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can update their own pending requests (e.g., add missing info)
CREATE POLICY "Users can update own pending request"
  ON professional_pending_verification
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending')
  WITH CHECK (auth.uid() = user_id AND status = 'pending');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_professional_pending_user_id 
  ON professional_pending_verification(user_id);

CREATE INDEX IF NOT EXISTS idx_professional_pending_status 
  ON professional_pending_verification(status);