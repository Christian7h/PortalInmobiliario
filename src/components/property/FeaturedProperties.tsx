import { useEffect, useState } from 'react';
import PropertyCarousel from './PropertyCarousel';
import { supabase } from '../../lib/supabase';
import type { Property } from '../../types';

const FeaturedProperties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      try {
        setLoading(true);
        
        // Get featured properties
        const { data: propertiesData, error: propertiesError } = await supabase
          .from('properties')
          .select('*')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (propertiesError) throw propertiesError;

        // Get images for each property
        const propertiesWithImages = await Promise.all(
          propertiesData.map(async (property) => {
            const { data: imageData } = await supabase
              .from('property_images')
              .select('*')
              .eq('property_id', property.id);
            
            return {
              ...property,
              images: imageData || [],
            };
          })
        );
        
        setProperties(propertiesWithImages);
      } catch (error) {
        setError('Error al cargar propiedades destacadas');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProperties();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <p>{error}</p>
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
      viewAllLink="/destacados"
      slidesPerView={3}
      autoplay={true}
      featured={true}
    />
  );
};

export default FeaturedProperties;