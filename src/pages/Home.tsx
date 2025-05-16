import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import PropertySearch from '../components/property/PropertySearch';
import FeaturedProperties from '../components/property/FeaturedProperties';
import PropertyCarousel from '../components/property/PropertyCarousel';
import type { Property, PropertyType } from '../types';
import { Building } from 'lucide-react';

const propertyCategories: { type: PropertyType; label: string }[] = [
  { type: 'casa', label: 'Casas' },
  { type: 'departamento', label: 'Departamentos' },
  { type: 'terreno', label: 'Terrenos' },
  { type: 'oficina', label: 'Oficinas' },
  { type: 'local', label: 'Locales' },
  { type: 'parcela', label: 'Parcelas' },
  { type: 'bodega', label: 'Bodegas' },
];

const Home: React.FC = () => {
  const [categoryProperties, setCategoryProperties] = useState<
    Record<PropertyType, Property[]>
  >({} as Record<PropertyType, Property[]>);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProperties = async () => {
      try {
        setLoading(true);
        
        // Fetch properties for each category
        const categoryData: Record<PropertyType, Property[]> = {} as Record<PropertyType, Property[]>;
        
        await Promise.all(
          propertyCategories.map(async (category) => {
            const { data: propertiesData } = await supabase
              .from('properties')
              .select('*')
              .eq('property_type', category.type)
              .order('created_at', { ascending: false })
              .limit(10);
            
            // Get images for each property
            if (propertiesData && propertiesData.length > 0) {
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
              
              categoryData[category.type] = propertiesWithImages;
            } else {
              categoryData[category.type] = [];
            }
          })
        );
        
        setCategoryProperties(categoryData);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProperties();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section 
        className="relative h-[70vh] bg-cover bg-center flex items-center"
        style={{ 
          backgroundImage: 'url(https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1600)'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="container mx-auto px-4 z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Encuentra la propiedad de tus sueños
          </h1>
          <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
            Casas, departamentos, oficinas y más. La mejor selección de propiedades en un solo lugar.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="#propiedades" 
              className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-6 rounded-md transition-colors"
            >
              Ver propiedades
            </a>
            <a 
              href="/contacto" 
              className="bg-transparent border-2 border-white hover:bg-white hover:text-slate-800 text-white font-medium py-3 px-6 rounded-md transition-colors"
            >
              Contactar
            </a>
          </div>
        </div>
      </section>

      <PropertySearch />

      <div id="propiedades" className="py-16">
        {loading ? (
          <div className="container mx-auto px-4 py-12">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          </div>
        ) : (
          <>
            <FeaturedProperties />

            {propertyCategories.map((category) => {
              const properties = categoryProperties[category.type];
              
              if (!properties || properties.length === 0) return null;
              
              return (
                <PropertyCarousel
                  key={category.type}
                  properties={properties}
                  title={category.label}
                  viewAllLink={`/categoria/${category.type}`}
                  slidesPerView={5}
                />
              );
            })}
          </>
        )}
      </div>

      <section className="bg-slate-100 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              ¿Por qué elegirnos?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ofrecemos la mejor experiencia para encontrar o publicar propiedades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-amber-100 p-4 rounded-full">
                  <Building className="h-8 w-8 text-amber-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Amplia selección</h3>
              <p className="text-gray-600">
                Miles de propiedades disponibles para encontrar exactamente lo que buscas.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-amber-100 p-4 rounded-full">
                  <Building className="h-8 w-8 text-amber-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Información detallada</h3>
              <p className="text-gray-600">
                Descripción completa, fotos de alta calidad y ubicación exacta.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-amber-100 p-4 rounded-full">
                  <Building className="h-8 w-8 text-amber-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Contacto directo</h3>
              <p className="text-gray-600">
                Comunícate directamente con los agentes para resolver todas tus dudas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;