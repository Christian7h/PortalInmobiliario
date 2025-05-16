-- Políticas RLS necesarias para el bucket de imágenes
-- Archivo para referencia: guarda esto como supabase/migrations/storage_security_policies.sql

-- Política para permitir lectura a todos los usuarios (anónimos y autenticados)
create policy "Imágenes visibles para todos"
on storage.objects for select
to public
using ( bucket_id = 'images' );

-- Política para permitir la carga solo a usuarios autenticados
create policy "Usuarios autenticados pueden cargar imágenes"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'images' AND
  auth.uid() = owner
);

-- Política para permitir actualizaciones solo al propietario del archivo
create policy "Usuarios solo pueden actualizar sus propias imágenes"
on storage.objects for update
to authenticated
using (
  bucket_id = 'images' AND
  auth.uid() = owner
);

-- Política para permitir eliminaciones solo al propietario del archivo
create policy "Usuarios solo pueden eliminar sus propias imágenes"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'images' AND
  auth.uid() = owner
);
