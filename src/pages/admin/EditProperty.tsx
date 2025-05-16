import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { PropertyImage, PropertyType, Currency } from '../../types';
import PropertyImages from '../../components/property/PropertyImages';

interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  currency: Currency;
  address: string;
  city: string;
  longitude?: number;
  latitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  area_unit: string;
  property_type: PropertyType;
  is_featured: boolean;
  user_id?: string;
}

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'local', label: 'Local Comercial' },
  { value: 'bodega', label: 'Bodega' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'parcela', label: 'Parcela' },
  { value: 'sitio', label: 'Sitio' },
  { value: 'loteo', label: 'Loteo' },
  { value: 'agricola', label: 'Terreno Agrícola' },
];

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    price: 0,
    currency: 'CLP',
    address: '',
    city: '',
    area_unit: 'm²',
    property_type: 'casa',
    is_featured: false
  });

  const loadProperty = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Cargar los datos de la propiedad
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (propertyError) throw propertyError;
      
      if (propertyData) {
        setFormData({
          title: propertyData.title || '',
          description: propertyData.description || '',
          price: propertyData.price || 0,
          currency: propertyData.currency || 'CLP',
          address: propertyData.address || '',
          city: propertyData.city || '',
          longitude: propertyData.longitude,
          latitude: propertyData.latitude,
          bedrooms: propertyData.bedrooms,
          bathrooms: propertyData.bathrooms,
          area: propertyData.area,
          area_unit: propertyData.area_unit || 'm²',
          property_type: propertyData.property_type || 'casa',
          is_featured: propertyData.is_featured || false
        });
      }
      
      // Cargar las imágenes de la propiedad
      const { data: imagesData, error: imagesError } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', id);

      if (imagesError) throw imagesError;
      
      if (imagesData) {
        setImages(imagesData);
      }
    } catch (error) {
      console.error('Error loading property:', error);
      setError('Error al cargar la propiedad. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id, loadProperty]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const propertyData = {
        ...formData,
        user_id: user.id
      };
      
      let propertyId = id;
      
      // Guardar o actualizar la propiedad
      if (id) {
        // Actualizar propiedad existente
        const { error: updateError } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', id);
        
        if (updateError) throw updateError;
      } else {
        // Insertar nueva propiedad
        const { data: newProperty, error: insertError } = await supabase
          .from('properties')
          .insert([propertyData])
          .select('id')
          .single();
        
        if (insertError) throw insertError;
        propertyId = newProperty.id;
      }
      
      // Procesar imágenes
      if (propertyId) {
        // Procesar cada imagen
        for (const image of images) {
          // Si la imagen ya tiene un ID real (no temporal), significa que ya existe en la BD
          if (!image.id.startsWith('temp_')) continue;
          
          // Insertar nueva imagen
          const { error: imageError } = await supabase
            .from('property_images')
            .insert([{
              property_id: propertyId,
              image_url: image.image_url,
              is_primary: image.is_primary,
              user_id: user.id
            }]);
          
          if (imageError) throw imageError;
        }
      }
      
      navigate('/admin/propiedades');
    } catch (error) {
      console.error('Error saving property:', error);
      setError('Error al guardar la propiedad. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'is_featured' && type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? 
          (value === '' ? undefined : Number(value)) : 
          value
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        {id ? 'Editar Propiedad' : 'Nueva Propiedad'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de Propiedad</label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Ciudad</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Precio</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price === 0 ? '' : formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Moneda</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                >
                  <option value="CLP">CLP</option>
                  <option value="UF">UF</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Dormitorios</label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms === undefined ? '' : formData.bedrooms}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Baños</label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms === undefined ? '' : formData.bathrooms}
                  onChange={handleChange}
                  min="0"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Superficie</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="number"
                    name="area"
                    value={formData.area === undefined ? '' : formData.area}
                    onChange={handleChange}
                    min="0"
                    className="flex-1 block w-full rounded-none rounded-l-md border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500">
                    {formData.area_unit}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                Destacar esta propiedad
              </label>
            </div>
          </div>
        </div>
        
        <div className="my-8">
          <PropertyImages 
            propertyId={id} 
            existingImages={images} 
            onImagesChange={setImages} 
          />
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/propiedades')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
              saving ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Guardando...' : 'Guardar Propiedad'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProperty;