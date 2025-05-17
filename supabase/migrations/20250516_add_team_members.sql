-- Crear tabla de miembros del equipo
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text NOT NULL,
  position text NOT NULL,
  bio text,
  photo_url text,
  email text,
  phone text,
  linkedin_url text,
  twitter_url text,
  instagram_url text,
  order_number integer DEFAULT 0, -- Para ordenar los miembros del equipo
  is_active boolean DEFAULT true,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Añadir campos adicionales a company_profile para mejorar la sección "Nosotros"
ALTER TABLE company_profile 
  ADD COLUMN IF NOT EXISTS mission text,
  ADD COLUMN IF NOT EXISTS vision text,
  ADD COLUMN IF NOT EXISTS values text,
  ADD COLUMN IF NOT EXISTS history text,
  ADD COLUMN IF NOT EXISTS years_experience integer;

-- Habilitar RLS para la tabla team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para team_members
CREATE POLICY "Usuarios autenticados pueden ver los miembros del equipo"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Solo los propietarios pueden insertar miembros del equipo"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Solo los propietarios pueden actualizar miembros del equipo"
  ON team_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Solo los propietarios pueden eliminar miembros del equipo"
  ON team_members FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
