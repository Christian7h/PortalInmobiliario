// filepath: src/components/property/FeaturedProperties.tsx
import { useQuery } from '@tanstack/react-query';
import PropertyCarousel from './PropertyCarousel';
import type { Property } from '../../types';
import { fetchFeaturedProperties } from '../../lib/api';

const FeaturedProperties: React.FC = () => {
  // Usamos useQuery para obtener y memorizar propiedades destacadas
  const { 
    data: properties = [], 
    isLoading: loading, 
    error 
  } = useQuery<Property[], Error>({
    queryKey: ['featuredProperties'],
    queryFn: fetchFeaturedProperties,
    staleTime: 1000 * 60 * 5, // 5 minutos antes de considerar los datos obsoletos
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center py-8">
          <div className="animate-spin inline-block rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <p>Error al cargar las propiedades destacadas.</p>
        </div>
      </div>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <PropertyCarousel
      properties={properties}
      title="Propiedades Destacadas"
      viewAllLink="/"
      slidesPerView={4}
      autoplay={true}
      featured={true}
    />
  );
};

export default FeaturedProperties;
