import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PropertyCard from '../components/property/PropertyCard';
import { Property } from '../types';
import { Filter, X, SlidersHorizontal } from 'lucide-react';

const propertyTypeLabels: Record<string, string> = {
  casa: 'Casas',
  departamento: 'Departamentos',
  oficina: 'Oficinas',
  local: 'Locales',
  bodega: 'Bodegas',
  industrial: 'Industriales',
  terreno: 'Terrenos',
  parcela: 'Parcelas',
  sitio: 'Sitios',
  loteo: 'Loteos',
  agricola: 'Agrícolas'
};

const sortOptions = [
  { value: 'newest', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio: menor a mayor' },
  { value: 'price_desc', label: 'Precio: mayor a menor' },
];

function CategoryPage() {
  const { type } = useParams<{ type: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Obtener parámetros de búsqueda
  const location = searchParams.get('location') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const currency = searchParams.get('currency') || '';
  const minBedrooms = searchParams.get('minBedrooms') || '';
  const minBathrooms = searchParams.get('minBathrooms') || '';
  const sortBy = searchParams.get('sortBy') || 'newest';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sortBy', e.target.value);
    setSearchParams(newParams);
  };

  useEffect(() => {
    async function fetchProperties() {
      try {
        setLoading(true);
        
        // Iniciar la consulta
        let query = supabase
          .from('properties')
          .select('*, property_images(*)')
          .eq('property_type', type);
        
        // Aplicar filtros adicionales si existen
        if (location) {
          query = query.or(`city.ilike.%${location}%,address.ilike.%${location}%`);
        }
        
        if (currency && minPrice) {
          query = query.eq('currency', currency).gte('price', minPrice);
        }
        
        if (currency && maxPrice) {
          query = query.eq('currency', currency).lte('price', maxPrice);
        }
        
        if (minBedrooms) {
          query = query.gte('bedrooms', minBedrooms);
        }
        
        if (minBathrooms) {
          query = query.gte('bathrooms', minBathrooms);
        }
        
        // Aplicar ordenamiento
        switch(sortBy) {
          case 'price_asc':
            query = query.order('price', { ascending: true });
            break;
          case 'price_desc':
            query = query.order('price', { ascending: false });
            break;
          case 'newest':
          default:
            query = query.order('created_at', { ascending: false });
            break;
        }
        
        const { data, error } = await query;

        if (error) throw error;
        
        // Asegurarse de que cada propiedad tenga un array de imágenes
        const propertiesWithImages = data?.map(property => {
          return {
            ...property,
            images: property.property_images || []
          };
        }) || [];
        
        setProperties(propertiesWithImages);
        
        // Actualizar filtros activos para mostrar
        const filters = [];
        if (location) filters.push(`Ubicación: ${location}`);
        if (minPrice || maxPrice) {
          const priceLabel = [];
          if (minPrice) priceLabel.push(`Desde ${currency} ${Number(minPrice).toLocaleString('es-CL')}`);
          if (maxPrice) priceLabel.push(`Hasta ${currency} ${Number(maxPrice).toLocaleString('es-CL')}`);
          filters.push(priceLabel.join(' '));
        }
        if (minBedrooms) filters.push(`${minBedrooms}+ dormitorios`);
        if (minBathrooms) filters.push(`${minBathrooms}+ baños`);
        
        setActiveFilters(filters);
        
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, [type, location, minPrice, maxPrice, currency, minBedrooms, minBathrooms, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">
          {propertyTypeLabels[type as keyof typeof propertyTypeLabels] || 'Propiedades'}
        </h1>
        
        <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center">
            <label htmlFor="sortBy" className="mr-2 text-sm text-gray-600">Ordenar por:</label>
            <select
              id="sortBy"
              className="p-2 border border-gray-300 rounded-md text-sm"
              value={sortBy}
              onChange={handleSortChange}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-gray-600">
            {properties.length} {properties.length === 1 ? 'resultado' : 'resultados'} encontrados
          </div>
        </div>
      </div>
      
      {activeFilters.length > 0 && (
        <div className="mb-6 bg-amber-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-amber-500" />
              <h2 className="text-lg font-medium">Filtros aplicados</h2>
            </div>
            <button
              onClick={() => {
                const newParams = new URLSearchParams();
                setSearchParams(newParams);
              }}
              className="text-amber-600 text-sm hover:text-amber-800 flex items-center"
            >
              <X size={14} className="mr-1" />
              Limpiar todos
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <div 
                key={index} 
                className="bg-white border border-amber-200 text-amber-800 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {filter}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {properties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <Filter className="mx-auto h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No se encontraron propiedades</h3>
          <p className="text-gray-600">
            No hay propiedades disponibles con los filtros seleccionados.
          </p>
          <button 
            onClick={() => {
              const newParams = new URLSearchParams();
              setSearchParams(newParams);
            }}
            className="mt-4 inline-block text-amber-600 hover:text-amber-700"
          >
            <div className="flex items-center">
              <X className="w-4 h-4 mr-1" />
              Limpiar filtros
            </div>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;