import { supabase } from "./supabase";

/**
 * Sube una imagen a Supabase Storage
 * @param file Archivo a subir
 * @param folder Carpeta donde se guardará el archivo
 * @returns URL pública del archivo o null si hay error
 */
export const uploadImage = async (file: File, folder: string = 'property_images'): Promise<string | null> => {
  // Verificar si el usuario está autenticado
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    console.error('Error: Usuario no autenticado. Debes iniciar sesión para subir imágenes.');
    return null;
  }
  try {
    if (!file) return null;
    
    // Crear un nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;
      // Subir archivo a Supabase Storage con metadatos adicionales
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        // Metadatos que pueden ser necesarios para cumplir con las políticas RLS
        upsert: true, // Sobreescribir el archivo si ya existe
        cacheControl: '3600',
        contentType: file.type // Asegurar que el tipo de contenido se establece correctamente
      });
    
    if (uploadError) {
      console.error('Error al subir la imagen:', uploadError);
      return null;
    }
    
    // Obtener la URL pública del archivo
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    return null;
  }
};

/**
 * Elimina una imagen de Supabase Storage
 * @param imageUrl URL de la imagen a eliminar
 * @returns true si se eliminó correctamente, false si hubo error
 */
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extraer el path de la URL
    const urlParts = imageUrl.split('/');
    const bucketName = 'images';
    const fileName = urlParts[urlParts.length - 1];
    const folderName = urlParts[urlParts.length - 2];
    const filePath = `${folderName}/${fileName}`;
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      console.error('Error al eliminar la imagen:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error al procesar la eliminación de la imagen:', error);
    return false;
  }
};
