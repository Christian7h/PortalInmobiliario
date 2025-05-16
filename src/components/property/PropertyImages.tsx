import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { PropertyImage } from '../../types';
import { uploadImage, deleteImage } from '../../lib/storage';

interface PropertyImagesProps {
  propertyId: string | undefined;
  existingImages: PropertyImage[];
  onImagesChange: (images: PropertyImage[]) => void;
}

const PropertyImages: React.FC<PropertyImagesProps> = ({ 
  propertyId, 
  existingImages, 
  onImagesChange 
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setUploading(true);
      setError(null);
      
      const newImages: PropertyImage[] = [...existingImages];
      
      // Procesar cada archivo
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Subir la imagen a Supabase Storage
        const imageUrl = await uploadImage(file, 'property_images');
        
        if (imageUrl) {
          // Crear un objeto de imagen temporal
          const newImage: PropertyImage = {
            id: `temp_${Date.now()}_${i}`, // ID temporal hasta que se guarde en la base de datos
            property_id: propertyId || '',
            image_url: imageUrl,
            is_primary: existingImages.length === 0 && i === 0, // Primera imagen como primaria si no hay otras
            user_id: '',
            created_at: new Date().toISOString()
          };
          
          newImages.push(newImage);
        }
      }
      
      // Actualizar el estado de las imágenes
      onImagesChange(newImages);
      
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      setError('Error al subir las imágenes. Por favor, inténtalo de nuevo.');
    } finally {
      setUploading(false);
      // Limpiar el input para permitir seleccionar los mismos archivos de nuevo
      e.target.value = '';
    }
  };

  const handleSetPrimary = (imageIndex: number) => {
    const updatedImages = existingImages.map((image, index) => ({
      ...image,
      is_primary: index === imageIndex
    }));
    
    onImagesChange(updatedImages);
  };

  const handleRemoveImage = async (imageIndex: number) => {
    const imageToRemove = existingImages[imageIndex];
    
    try {
      setUploading(true);
      setError(null);
      
      // Si la imagen ya existe en la base de datos y tiene un ID real (no temporal)
      if (imageToRemove.id && !imageToRemove.id.startsWith('temp_')) {
        // Eliminar la imagen de Supabase Storage
        await deleteImage(imageToRemove.image_url);
        
        // Si tenemos un propertyId, eliminar también de la base de datos
        if (propertyId) {
          await supabase
            .from('property_images')
            .delete()
            .eq('id', imageToRemove.id);
        }
      } else {
        // Si es una imagen temporal, solo eliminar de Storage
        await deleteImage(imageToRemove.image_url);
      }
      
      // Actualizar el estado de las imágenes
      const updatedImages = existingImages.filter((_, index) => index !== imageIndex);
      
      // Si la imagen eliminada era la primaria y todavía hay imágenes, establecer la primera como primaria
      if (imageToRemove.is_primary && updatedImages.length > 0) {
        updatedImages[0].is_primary = true;
      }
      
      onImagesChange(updatedImages);
      
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      setError('Error al eliminar la imagen. Por favor, inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Imágenes de la Propiedad</label>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {existingImages.map((image, index) => (
          <div key={image.id} className="relative border rounded-lg overflow-hidden">
            <img 
              src={image.image_url} 
              alt={`Imagen de propiedad ${index + 1}`} 
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => handleSetPrimary(index)}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    image.is_primary 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {image.is_primary ? 'Principal' : 'Hacer principal'}
                </button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center h-40">
          <label className="cursor-pointer text-center p-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="block text-sm font-medium text-gray-700 mt-2">
              {uploading ? 'Subiendo...' : 'Añadir imágenes'}
            </span>
            <input
              type="file"
              multiple
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>
      
      <p className="text-sm text-gray-500">
        * La imagen marcada como "Principal" será la que se muestre como destacada.
      </p>
    </div>
  );
};

export default PropertyImages;
