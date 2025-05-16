/*
  # Initial schema for real estate portal (Single Agent Model)

  1. New Tables
    - `properties`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
      - `title` (text)
      - `description` (text)
      - `price` (numeric)
      - `currency` (text)
      - `address` (text)
      - `city` (text)
      - `longitude` (double precision, nullable)
      - `latitude` (double precision, nullable)
      - `bedrooms` (integer, nullable)
      - `bathrooms` (integer, nullable)
      - `area` (numeric, nullable)
      - `area_unit` (text)
      - `property_type` (text)
      - `is_featured` (boolean)
      - `user_id` (uuid, foreign key to auth.users)
    
    - `property_images`
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `property_id` (uuid, foreign key to properties)
      - `image_url` (text)
      - `is_primary` (boolean)
      - `user_id` (uuid, foreign key to auth.users)
    
    - `company_profile`
      - `id` (uuid, primary key)
      - `updated_at` (timestamp with time zone)
      - `company_name` (text)
      - `contact_email` (text)
      - `contact_phone` (text)
      - `logo_url` (text, nullable)
      - `description` (text)
      - `address` (text)
      - `facebook_url` (text, nullable)
      - `instagram_url` (text, nullable)
      - `linkedin_url` (text, nullable)
      - `twitter_url` (text, nullable)
      - `whatsapp_number` (text, nullable)
      - `user_id` (uuid, foreign key to auth.users)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for CRUD operations
*/

-- Create tables

CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  currency text NOT NULL CHECK (currency IN ('CLP', 'UF')),
  address text NOT NULL,
  city text NOT NULL,
  longitude double precision,
  latitude double precision,
  bedrooms integer,
  bathrooms integer,
  area numeric,
  area_unit text DEFAULT 'm²',
  property_type text NOT NULL CHECK (property_type IN ('casa', 'departamento', 'oficina', 'local', 'bodega', 'industrial', 'terreno', 'parcela', 'sitio', 'loteo', 'agricola')),
  is_featured boolean DEFAULT false,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS property_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  is_primary boolean DEFAULT false,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS company_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  updated_at timestamptz DEFAULT now(),
  company_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  logo_url text,
  description text,
  address text,
  facebook_url text,
  instagram_url text,
  linkedin_url text,
  twitter_url text,
  whatsapp_number text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(user_id)
);

-- Set up Row Level Security

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profile ENABLE ROW LEVEL SECURITY;

-- Create policies for properties table

-- Anyone can view properties
CREATE POLICY "Properties are viewable by everyone"
  ON properties
  FOR SELECT
  USING (true);

-- Only the owner can insert properties
CREATE POLICY "Users can insert their own properties"
  ON properties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only the owner can update their properties
CREATE POLICY "Users can update their own properties"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only the owner can delete their properties
CREATE POLICY "Users can delete their own properties"
  ON properties
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for property_images table

-- Anyone can view property images
CREATE POLICY "Property images are viewable by everyone"
  ON property_images
  FOR SELECT
  USING (true);

-- Only the owner can insert property images
CREATE POLICY "Users can insert their own property images"
  ON property_images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only the owner can update their property images
CREATE POLICY "Users can update their own property images"
  ON property_images
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only the owner can delete their property images
CREATE POLICY "Users can delete their own property images"
  ON property_images
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for company_profile table

-- Company profile is viewable by everyone
CREATE POLICY "Company profile is viewable by everyone"
  ON company_profile
  FOR SELECT
  USING (true);

-- Only the owner can insert their company profile
CREATE POLICY "User can insert their company profile"
  ON company_profile
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Only the owner can update their company profile
CREATE POLICY "User can update their company profile"
  ON company_profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to update the updated_at column
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON company_profile
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();