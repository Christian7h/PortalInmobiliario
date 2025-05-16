import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Bed, Bath, Square as SquareFoot, Phone, Mail, Share2 } from 'lucide-react';
import type { Property } from '../types';
import { register } from 'swiper/element/bundle';

register();

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        if (!id) throw new Error('No property ID provided');
        
        setLoading(true);
        
        // Get property
        const { data: propertyData, error: propertyError } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single();
        
        if (propertyError) throw propertyError;
        if (!propertyData) throw new Error('Property not found');
        
        // Get images
        const { data: imageData } = await supabase
          .from('property_images')
          .select('*')
          .eq('property_id', id);
        
        // Get profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', propertyData.user_id)
          .single();
        
        setProperty({
          ...propertyData,
          images: imageData || [],
          profile: profileData || null,
        } as Property);
      } catch (error) {
        console.error(error);
        setError('Error al cargar la propiedad. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'UF') {
      return `UF ${price.toLocaleString('es-CL')}`;
    }
    return `CLP ${price.toLocaleString('es-CL')}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <p>{error || 'Propiedad no encontrada'}</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Link to="/" className="hover:text-amber-600">Inicio</Link>
            <span className="mx-2">/</span>
            <Link to={`/categoria/${property.property_type}`} className="hover:text-amber-600">
              {property.property_type.charAt(0).toUpperCase() + property.property_type.slice(1)}s
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium">{property.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Image Gallery */}
              {property.images && property.images.length > 0 ? (
                <div className="relative h-96">
                  <swiper-container
                    navigation="true"
                    pagination="true"
                    class="h-full w-full"
                  >
                    {property.images.map((image) => (
                      <swiper-slide key={image.id}>
                        <img 
                          src={image.image_url} 
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </swiper-slide>
                    ))}
                  </swiper-container>
                </div>
              ) : (
                <div className="h-96 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No hay imágenes disponibles</p>
                </div>
              )}

              {/* Property Info */}
              <div className="p-6">
                <div className="flex flex-wrap justify-between items-start mb-4">
                  <h1 className="text-2xl font-bold text-slate-800 mb-2 md:mb-0">{property.title}</h1>
                  <div className="text-2xl font-bold text-amber-600">
                    {formatPrice(property.price, property.currency)}
                  </div>
                </div>

                <div className="flex items-center text-gray-600 mb-6">
                  <MapPin size={18} className="mr-1" />
                  <span>{property.address}, {property.city}</span>
                </div>

                <div className="flex flex-wrap gap-6 border-t border-b border-gray-200 py-4 my-4">
                  {property.bedrooms !== null && (
                    <div className="flex items-center">
                      <Bed size={20} className="text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Dormitorios</p>
                        <p className="font-semibold">{property.bedrooms}</p>
                      </div>
                    </div>
                  )}
                  
                  {property.bathrooms !== null && (
                    <div className="flex items-center">
                      <Bath size={20} className="text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Baños</p>
                        <p className="font-semibold">{property.bathrooms}</p>
                      </div>
                    </div>
                  )}
                  
                  {property.area !== null && (
                    <div className="flex items-center">
                      <SquareFoot size={20} className="text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Superficie</p>
                        <p className="font-semibold">{property.area} m²</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">Descripción</h2>
                  <div 
                    className="prose max-w-none text-gray-600"
                    dangerouslySetInnerHTML={{ __html: property.description }}
                  />
                </div>

                {/* Location Map - Will be replaced with react-leaflet */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">Ubicación</h2>
                  <div className="bg-gray-100 h-80 rounded-lg">
                    {/* Map will go here using react-leaflet */}
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <p>Mapa de ubicación se mostrará aquí</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-xl font-semibold text-slate-800 mb-4">Contactar</h3>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Información de contacto:</p>
                {property.profile ? (
                  <div className="flex items-center mb-3">
                    {property.profile.logo_url ? (
                      <img 
                        src={property.profile.logo_url} 
                        alt={property.profile.company_name}
                        className="w-12 h-12 object-cover rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                        <Building className="w-6 h-6 text-amber-600" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{property.profile.company_name}</p>
                      <p className="text-sm text-gray-600">Agente Inmobiliario</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 mb-3">Agente Inmobiliario</p>
                )}
                
                <div className="flex flex-col space-y-2 mb-6">
                  <a 
                    href={`tel:${property.profile?.contact_phone || '+56912345678'}`}
                    className="flex items-center text-gray-600 hover:text-amber-600"
                  >
                    <Phone size={18} className="mr-2" />
                    <span>{property.profile?.contact_phone || '+56 9 1234 5678'}</span>
                  </a>
                  <a 
                    href={`mailto:${property.profile?.contact_email || 'contacto@propportal.com'}`}
                    className="flex items-center text-gray-600 hover:text-amber-600"
                  >
                    <Mail size={18} className="mr-2" />
                    <span>{property.profile?.contact_email || 'contacto@propportal.com'}</span>
                  </a>
                </div>
              </div>
              
              <form className="mb-6">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    defaultValue={`Me interesa esta propiedad con referencia ${property.id}`}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full bg-amber-500 text-white font-medium py-2 px-4 rounded-md hover:bg-amber-600 transition-colors"
                >
                  Enviar mensaje
                </button>
              </form>
              
              <div className="border-t pt-4">
                <button
                  className="flex items-center justify-center w-full border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Share2 size={18} className="mr-2" />
                  Compartir propiedad
                </button>
                
                <div className="flex space-x-2 mt-4">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Mira esta propiedad: ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center bg-green-500 text-white font-medium py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Facebook
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;