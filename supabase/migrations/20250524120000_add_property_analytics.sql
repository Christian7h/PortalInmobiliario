/*
  # Add analytics fields to properties table

  1. Changes
    - Add virtual tour URL field
    - Add property analytics fields
      - Year built
      - Parking spaces
      - Total floors
      - Floor number
      - Maintenance fee
      - Energy rating
      - Construction status
    - Add neighborhood analytics fields
      - Schools proximity
      - Shops proximity  
      - Transport proximity
      - Green areas proximity
      - Services proximity
      - Average square meter price
      - Annual property value increase
      - Security index
      - Quality of life index
*/

-- Añadir campos de análisis básicos de la propiedad
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS virtual_tour_url text,
ADD COLUMN IF NOT EXISTS year_built integer,
ADD COLUMN IF NOT EXISTS parking_spaces integer,
ADD COLUMN IF NOT EXISTS total_floors integer,
ADD COLUMN IF NOT EXISTS floor_number integer,
ADD COLUMN IF NOT EXISTS maintenance_fee numeric,
ADD COLUMN IF NOT EXISTS energy_rating text CHECK (energy_rating IN (NULL, 'A', 'B', 'C', 'D', 'E', 'F', 'G')),
ADD COLUMN IF NOT EXISTS construction_status text DEFAULT 'terminado' CHECK (construction_status IN ('terminado', 'en_construccion', 'en_plano', 'por_renovar'));

-- Añadir campos de análisis del vecindario
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS schools_nearby jsonb DEFAULT '{"count": 0, "distance": 0}',
ADD COLUMN IF NOT EXISTS shops_nearby jsonb DEFAULT '{"count": 0, "distance": 0}',
ADD COLUMN IF NOT EXISTS transport_nearby jsonb DEFAULT '{"count": 0, "distance": 0}',
ADD COLUMN IF NOT EXISTS green_areas_nearby jsonb DEFAULT '{"count": 0, "distance": 0}',
ADD COLUMN IF NOT EXISTS services_nearby jsonb DEFAULT '{"count": 0, "distance": 0}',
ADD COLUMN IF NOT EXISTS avg_square_meter_price numeric,
ADD COLUMN IF NOT EXISTS annual_value_increase numeric,
ADD COLUMN IF NOT EXISTS security_index integer CHECK (security_index IS NULL OR (security_index >= 0 AND security_index <= 100)),
ADD COLUMN IF NOT EXISTS life_quality_index integer CHECK (life_quality_index IS NULL OR (life_quality_index >= 0 AND life_quality_index <= 100)),
ADD COLUMN IF NOT EXISTS demographics jsonb DEFAULT '{"families": 40, "young_professionals": 30, "retired": 20, "students": 10}';
