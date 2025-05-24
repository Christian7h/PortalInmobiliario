import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { PropertyImage, PropertyType, Currency, PublicationStatus, OperationType } from '../../types';
import PropertyImages from '../../components/property/PropertyImages';
import LocationPicker from '../../components/property/LocationPicker';

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
  publication_status: PublicationStatus;
  operation_type: OperationType;
  user_id?: string;
  // Nuevos campos de análisis
  virtual_tour_url?: string;
  year_built?: number;
  parking_spaces?: number;
  total_floors?: number;
  floor_number?: number;
  maintenance_fee?: number;
  energy_rating?: string;
  construction_status?: string;
  // Campos de análisis del vecindario
  schools_nearby?: { count: number; distance: number };
  shops_nearby?: { count: number; distance: number };
  transport_nearby?: { count: number; distance: number };
  green_areas_nearby?: { count: number; distance: number };
  services_nearby?: { count: number; distance: number };
  avg_square_meter_price?: number;
  annual_value_increase?: number;
  security_index?: number;
  life_quality_index?: number;
  // Demografía del vecindario
  demographics?: {
    families?: number;
    young_professionals?: number;
    retired?: number;
    students?: number;
  };
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

const energyRatings = [
  { value: 'A', label: 'A - Muy eficiente' },
  { value: 'B', label: 'B - Eficiente' },
  { value: 'C', label: 'C - Bastante eficiente' },
  { value: 'D', label: 'D - Promedio' },
  { value: 'E', label: 'E - Poco eficiente' },
  { value: 'F', label: 'F - Ineficiente' },
  { value: 'G', label: 'G - Muy ineficiente' },
];

const constructionStatuses = [
  { value: 'terminado', label: 'Terminado' },
  { value: 'en_construccion', label: 'En construcción' },
  { value: 'en_plano', label: 'En plano' },
  { value: 'por_renovar', label: 'Por renovar' },
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
    is_featured: false,
    publication_status: 'disponible',
    operation_type: 'venta',
    // Nuevos campos
    virtual_tour_url: '',
    year_built: undefined,
    parking_spaces: undefined,
    total_floors: undefined,
    floor_number: undefined,
    maintenance_fee: undefined,
    energy_rating: undefined,
    construction_status: 'terminado',
    // Análisis del vecindario
    schools_nearby: { count: 0, distance: 0 },
    shops_nearby: { count: 0, distance: 0 },
    transport_nearby: { count: 0, distance: 0 },
    green_areas_nearby: { count: 0, distance: 0 },
    services_nearby: { count: 0, distance: 0 },
    avg_square_meter_price: undefined,
    annual_value_increase: undefined,
    security_index: undefined,
    life_quality_index: undefined,
    // Demografía
    demographics: {
      families: 40,
      young_professionals: 30,
      retired: 20,
      students: 10
    }
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
          is_featured: propertyData.is_featured || false,
          publication_status: propertyData.publication_status || 'disponible',
          operation_type: propertyData.operation_type || 'venta',
          // Cargar campos de análisis si existen
          virtual_tour_url: propertyData.virtual_tour_url || '',
          year_built: propertyData.year_built,
          parking_spaces: propertyData.parking_spaces,
          total_floors: propertyData.total_floors,
          floor_number: propertyData.floor_number,
          maintenance_fee: propertyData.maintenance_fee,
          energy_rating: propertyData.energy_rating,
          construction_status: propertyData.construction_status || 'terminado',
          // Cargar datos del vecindario
          schools_nearby: propertyData.schools_nearby || { count: 0, distance: 0 },
          shops_nearby: propertyData.shops_nearby || { count: 0, distance: 0 },
          transport_nearby: propertyData.transport_nearby || { count: 0, distance: 0 },
          green_areas_nearby: propertyData.green_areas_nearby || { count: 0, distance: 0 },
          services_nearby: propertyData.services_nearby || { count: 0, distance: 0 },
          avg_square_meter_price: propertyData.avg_square_meter_price,
          annual_value_increase: propertyData.annual_value_increase,
          security_index: propertyData.security_index,
          life_quality_index: propertyData.life_quality_index,
          // Cargar datos de demografía
          demographics: propertyData.demographics || {
            families: 40,
            young_professionals: 30,
            retired: 20,
            students: 10
          }
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
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación en el Mapa</label>
              <LocationPicker
                initialPosition={
                  formData.latitude && formData.longitude 
                    ? [formData.latitude, formData.longitude] 
                    : undefined
                }
                onLocationChange={(lat, lng) => {
                  setFormData(prev => ({
                    ...prev,
                    latitude: lat,
                    longitude: lng
                  }));
                }}
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
          </div>              <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Operación</label>
                <select
                  name="operation_type"
                  value={formData.operation_type}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                >
                  <option value="venta">Venta</option>
                  <option value="arriendo">Arriendo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Estado de Publicación</label>
                <select
                  name="publication_status"
                  value={formData.publication_status}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                >
                  <option value="disponible">Disponible</option>
                  <option value="reservado">Reservado</option>
                  <option value="arrendado">Arriendo</option>
                  <option value="vendido">Vendido</option>
                </select>
              </div>
            </div>
            
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
        
        {/* Sección de Tour Virtual */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tour Virtual y Características Adicionales</h3>
          
          <div className="grid grid-cols-1 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">URL del Tour Virtual</label>
              <input
                type="url"
                name="virtual_tour_url"
                value={formData.virtual_tour_url || ''}
                onChange={handleChange}
                placeholder="https://ejemplo.com/tour-virtual"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Introduce la URL de Matterport, Kuula, YouTube u otro proveedor de tours virtuales
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Datos de la Construcción</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Año de Construcción</label>
                  <input
                    type="number"
                    name="year_built"
                    value={formData.year_built === undefined ? '' : formData.year_built}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estacionamientos</label>
                  <input
                    type="number"
                    name="parking_spaces"
                    value={formData.parking_spaces === undefined ? '' : formData.parking_spaces}
                    onChange={handleChange}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pisos Totales</label>
                  <input
                    type="number"
                    name="total_floors"
                    value={formData.total_floors === undefined ? '' : formData.total_floors}
                    onChange={handleChange}
                    min="1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número de Piso</label>
                  <input
                    type="number"
                    name="floor_number"
                    value={formData.floor_number === undefined ? '' : formData.floor_number}
                    onChange={handleChange}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Información Adicional</h4>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gastos Comunes</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      {formData.currency === 'UF' ? 'UF' : '$'}
                    </span>
                    <input
                      type="number"
                      name="maintenance_fee"
                      value={formData.maintenance_fee === undefined ? '' : formData.maintenance_fee}
                      onChange={handleChange}
                      min="0"
                      step={formData.currency === 'UF' ? '0.01' : '1'}
                      className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Calificación Energética</label>
                  <select
                    name="energy_rating"
                    value={formData.energy_rating || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  >
                    <option value="">Sin calificación</option>
                    {energyRatings.map(rating => (
                      <option key={rating.value} value={rating.value}>{rating.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado de la Construcción</label>
                  <select
                    name="construction_status"
                    value={formData.construction_status || 'terminado'}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  >
                    {constructionStatuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sección Análisis del Vecindario */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Análisis del Vecindario</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Servicios Cercanos</h4>
              
              {/* Colegios */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Colegios (cantidad)</label>
                  <input
                    type="number"
                    name="schools_nearby.count"
                    value={formData.schools_nearby?.count || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setFormData({
                        ...formData,
                        schools_nearby: {
                          ...formData.schools_nearby,
                          count: isNaN(value) ? 0 : value
                        }
                      });
                    }}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Distancia (km)</label>
                  <input
                    type="number"
                    name="schools_nearby.distance"
                    value={formData.schools_nearby?.distance || 0}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setFormData({
                        ...formData,
                        schools_nearby: {
                          ...formData.schools_nearby,
                          distance: isNaN(value) ? 0 : value
                        }
                      });
                    }}
                    min="0"
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
              
              {/* Comercios */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Comercios (cantidad)</label>
                  <input
                    type="number"
                    name="shops_nearby.count"
                    value={formData.shops_nearby?.count || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setFormData({
                        ...formData,
                        shops_nearby: {
                          ...formData.shops_nearby,
                          count: isNaN(value) ? 0 : value
                        }
                      });
                    }}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Distancia (km)</label>
                  <input
                    type="number"
                    name="shops_nearby.distance"
                    value={formData.shops_nearby?.distance || 0}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setFormData({
                        ...formData,
                        shops_nearby: {
                          ...formData.shops_nearby,
                          distance: isNaN(value) ? 0 : value
                        }
                      });
                    }}
                    min="0"
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
              
              {/* Transporte */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Transporte (cantidad)</label>
                  <input
                    type="number"
                    name="transport_nearby.count"
                    value={formData.transport_nearby?.count || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setFormData({
                        ...formData,
                        transport_nearby: {
                          ...formData.transport_nearby,
                          count: isNaN(value) ? 0 : value
                        }
                      });
                    }}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Distancia (km)</label>
                  <input
                    type="number"
                    name="transport_nearby.distance"
                    value={formData.transport_nearby?.distance || 0}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setFormData({
                        ...formData,
                        transport_nearby: {
                          ...formData.transport_nearby,
                          distance: isNaN(value) ? 0 : value
                        }
                      });
                    }}
                    min="0"
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Áreas verdes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Áreas Verdes (cantidad)</label>
                  <input
                    type="number"
                    name="green_areas_nearby.count"
                    value={formData.green_areas_nearby?.count || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setFormData({
                        ...formData,
                        green_areas_nearby: {
                          ...formData.green_areas_nearby,
                          count: isNaN(value) ? 0 : value
                        }
                      });
                    }}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Distancia (km)</label>
                  <input
                    type="number"
                    name="green_areas_nearby.distance"
                    value={formData.green_areas_nearby?.distance || 0}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setFormData({
                        ...formData,
                        green_areas_nearby: {
                          ...formData.green_areas_nearby,
                          distance: isNaN(value) ? 0 : value
                        }
                      });
                    }}
                    min="0"
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
              
              {/* Servicios */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Servicios (cantidad)</label>
                  <input
                    type="number"
                    name="services_nearby.count"
                    value={formData.services_nearby?.count || 0}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setFormData({
                        ...formData,
                        services_nearby: {
                          ...formData.services_nearby,
                          count: isNaN(value) ? 0 : value
                        }
                      });
                    }}
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Distancia (km)</label>
                  <input
                    type="number"
                    name="services_nearby.distance"
                    value={formData.services_nearby?.distance || 0}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      setFormData({
                        ...formData,
                        services_nearby: {
                          ...formData.services_nearby,
                          distance: isNaN(value) ? 0 : value
                        }
                      });
                    }}
                    min="0"
                    step="0.1"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
              
              {/* Estadísticas del sector */}
              <h4 className="font-medium text-gray-700 mt-6">Estadísticas del Sector</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valor Promedio m²</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                      {formData.currency === 'UF' ? 'UF' : '$'}
                    </span>
                    <input
                      type="number"
                      name="avg_square_meter_price"
                      value={formData.avg_square_meter_price === undefined ? '' : formData.avg_square_meter_price}
                      onChange={handleChange}
                      min="0"
                      step={formData.currency === 'UF' ? '0.01' : '1000'}
                      className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plusvalía Anual (%)</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="number"
                      name="annual_value_increase"
                      value={formData.annual_value_increase === undefined ? '' : formData.annual_value_increase}
                      onChange={handleChange}
                      min="0"
                      step="0.1"
                      className="flex-1 block w-full rounded-l-md border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500">
                      %
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Índice de Seguridad (0-100)</label>
                  <input
                    type="number"
                    name="security_index"
                    value={formData.security_index === undefined ? '' : formData.security_index}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Calidad de Vida (0-100)</label>
                  <input
                    type="number"
                    name="life_quality_index"
                    value={formData.life_quality_index === undefined ? '' : formData.life_quality_index}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Demografía del vecindario */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Demografía del Vecindario</h3>
          <p className="text-sm text-gray-500 mb-4">Porcentaje estimado de cada grupo demográfico en el área (total 100%)</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Familias (%)</label>
              <input
                type="number"
                name="demographics.families"
                value={formData.demographics?.families || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setFormData({
                    ...formData,
                    demographics: {
                      ...formData.demographics,
                      families: isNaN(value) ? 0 : value
                    }
                  });
                }}
                min="0"
                max="100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Jóvenes Profesionales (%)</label>
              <input
                type="number"
                name="demographics.young_professionals"
                value={formData.demographics?.young_professionals || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setFormData({
                    ...formData,
                    demographics: {
                      ...formData.demographics,
                      young_professionals: isNaN(value) ? 0 : value
                    }
                  });
                }}
                min="0"
                max="100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Jubilados (%)</label>
              <input
                type="number"
                name="demographics.retired"
                value={formData.demographics?.retired || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setFormData({
                    ...formData,
                    demographics: {
                      ...formData.demographics,
                      retired: isNaN(value) ? 0 : value
                    }
                  });
                }}
                min="0"
                max="100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Estudiantes (%)</label>
              <input
                type="number"
                name="demographics.students"
                value={formData.demographics?.students || 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setFormData({
                    ...formData,
                    demographics: {
                      ...formData.demographics,
                      students: isNaN(value) ? 0 : value
                    }
                  });
                }}
                min="0"
                max="100"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
          </div>
          
          <div className="mt-3">
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
              <p className="text-sm text-amber-700">
                <strong>Tip:</strong> La suma de todos los porcentajes debería ser 100%. Los valores actuales suman: 
                {(formData.demographics?.families || 0) + 
                 (formData.demographics?.young_professionals || 0) + 
                 (formData.demographics?.retired || 0) + 
                 (formData.demographics?.students || 0)}%
              </p>
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