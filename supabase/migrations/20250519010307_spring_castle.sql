/*
  # Add lead management functionality

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `message` (text)
      - `property_id` (uuid, foreign key to properties)
      - `status` (text)
      - `notes` (text)
      - `user_id` (uuid, foreign key to auth.users)
      - `source` (text)
      - `last_contact` (timestamp with time zone)

  2. Security
    - Enable RLS on leads table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  message text NOT NULL,
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted')) DEFAULT 'new',
  notes text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source text NOT NULL CHECK (source IN ('website', 'whatsapp', 'email')) DEFAULT 'website',
  last_contact timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert leads"
  ON leads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads"
  ON leads
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads"
  ON leads
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER set_timestamp
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_timestamp();