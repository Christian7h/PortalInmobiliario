import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeftRight, Check, X } from 'lucide-react';
import type { Property } from '../../types';

interface PropertyComparisonProps {
  currentPropertyId: string;
}

const PropertyComparison: React.FC<PropertyComparisonProps> = ({ currentPropertyId }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([currentPropertyId]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .neq('id', currentPropertyId)
        .limit(10);
      
      setProperties(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setLoading(false);
    }
  };

  const toggleProperty = (propertyId: string) => {
    setSelectedProperties(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId);
      }
      if (prev.length < 3) {
        return [...prev, propertyId];
      }
      return prev;
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency === 'UF' ? 'CLF' : 'CLP',
      minimumFractionDigits: currency === 'UF' ? 2 : 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const selectedPropertyDetails = properties.filter(p => selectedProperties.includes(p.id));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <ArrowLeftRight className="w-6 h-6 text-amber-500 mr-2" />
        <h3 className="text-xl font-semibold">Comparar Propiedades</h3>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar propiedades para comparar (máximo 3):
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map(property => (
            <div
              key={property.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedProperties.includes(property.id)
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-amber-300'
              }`}
              onClick={() => toggleProperty(property.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{property.title}</h4>
                  <p className="text-sm text-gray-600">{property.address}</p>
                  <p className="text-amber-600 font-medium mt-2">
                    {formatPrice(property.price, property.currency)}
                  </p>
                </div>
                {selectedProperties.includes(property.id) && (
                  <Check className="w-5 h-5 text-amber-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPropertyDetails.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Característica</th>
                {selectedPropertyDetails.map(property => (
                  <th key={property.id} className="text-left py-2">{property.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 font-medium">Precio</td>
                {selectedPropertyDetails.map(property => (
                  <td key={property.id} className="py-2">
                    {formatPrice(property.price, property.currency)}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Tipo</td>
                {selectedPropertyDetails.map(property => (
                  <td key={property.id} className="py-2">{property.property_type}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Dormitorios</td>
                {selectedPropertyDetails.map(property => (
                  <td key={property.id} className="py-2">{property.bedrooms || '-'}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Baños</td>
                {selectedPropertyDetails.map(property => (
                  <td key={property.id} className="py-2">{property.bathrooms || '-'}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Superficie</td>
                {selectedPropertyDetails.map(property => (
                  <td key={property.id} className="py-2">
                    {property.area ? `${property.area} ${property.area_unit}` : '-'}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2 font-medium">Ciudad</td>
                {selectedPropertyDetails.map(property => (
                  <td key={property.id} className="py-2">{property.city}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PropertyComparison;