import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square as SquareFoot } from 'lucide-react';
import type { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  if (!property) {
    return null;
  }

  const { 
    id, 
    title = 'Propiedad sin título', 
    address = 'Sin dirección', 
    city = 'Sin ciudad', 
    price = 0, 
    currency = 'CLP', 
    bedrooms, 
    bathrooms, 
    area, 
    images = []
  } = property;
  
  const formatPrice = (price: number, currency: string) => {
    if (currency === 'UF') {
      return `UF ${price.toLocaleString('es-CL')}`;
    }
    return `CLP ${price.toLocaleString('es-CL')}`;
  };

  // Get primary image or first image or fallback
  const primaryImage = images?.find?.(img => img.is_primary)?.image_url || 
                     images?.[0]?.image_url || 
                     'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg';

  return (
    <Link 
      to={`/propiedad/${id}`}
      className="group block w-full h-full rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white transform hover:scale-[1.02]"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={primaryImage} 
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-amber-500 text-white px-2 py-1 text-sm font-semibold rounded">
          {formatPrice(price, currency)}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-slate-800 line-clamp-1 group-hover:text-amber-600 transition-colors">
          {title}
        </h3>
        
        <div className="flex items-center mt-2 text-gray-500">
          <MapPin size={14} className="mr-1" />
          <span className="text-sm line-clamp-1">{address}, {city}</span>
        </div>
        
        <div className="flex items-center justify-between mt-4 text-sm text-gray-700">
          {bedrooms !== null && (
            <div className="flex items-center">
              <Bed size={16} className="mr-1" />
              <span>{bedrooms}</span>
            </div>
          )}
          
          {bathrooms !== null && (
            <div className="flex items-center">
              <Bath size={16} className="mr-1" />
              <span>{bathrooms}</span>
            </div>
          )}
          
          {area !== null && (
            <div className="flex items-center">
              <SquareFoot size={16} className="mr-1" />
              <span>{area} m²</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;