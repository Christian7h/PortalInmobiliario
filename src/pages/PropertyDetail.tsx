import { Building, Bed, Bath, Square as SquareIcon, MapPin, Mail, Phone, MessageCircle, Share2 } from 'lucide-react';
import { fetchPropertyById } from '../lib/api';
import { Property } from '../types';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { register } from 'swiper/element/bundle';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './PropertyDetail.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import ContactForm from '../components/contact/ContactForm';
import { useToast } from '../context/useToast';

// Corrigiendo el problema de íconos de Leaflet en el entorno de React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configurar el ícono por defecto para los marcadores de Leaflet
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

register();

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  
  // Usamos React Query para gestionar el estado y la caché de los datos
  const { 
    data: property,
    isLoading: loading,
    error
  } = useQuery<Property, Error>({
    queryKey: ['property', id], // clave única para identificar esta consulta
    queryFn: () => {
      if (!id) throw new Error('No property ID provided');
      return fetchPropertyById(id);
    },
    staleTime: 1000 * 60 * 5, // 5 minutos antes de considerar los datos obsoletos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  });

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
          <p>{error instanceof Error ? error.message : 'Propiedad no encontrada'}</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Galería de imágenes */}
      <div className="property-detail-gallery w-full h-[50vh] md:h-[60vh] relative overflow-hidden">
        <div className="absolute inset-0">
          <swiper-container
            pagination="true"
            navigation="true"
            loop="true"
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
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-10 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal - Información y descripción */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Property Info */}
              <div className="p-6 pt-8 relative z-10 bg-white">
                <div className="flex flex-wrap justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2 md:mb-0">{property.title}</h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                        property.operation_type === 'venta' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {property.operation_type === 'venta' ? 'Venta' : 'Arriendo'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                        property.publication_status === 'disponible' ? 'bg-green-100 text-green-800' : 
                        property.publication_status === 'reservado' ? 'bg-yellow-100 text-yellow-800' :
                        property.publication_status === 'arrendado' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {property.publication_status === 'disponible' ? 'Disponible' : 
                         property.publication_status === 'reservado' ? 'Reservado' :
                         property.publication_status === 'arrendado' ? 'Arrendado' :
                         'Vendido'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <p className="text-2xl font-bold text-amber-600">
                      {formatPrice(property.price, property.currency)}
                    </p>
                  </div>
                </div>

                <p className="flex items-center text-slate-600 mb-4">
                  <MapPin className="w-5 h-5 mr-1 text-amber-500" />
                  {property.address}, {property.city}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="flex flex-col items-center p-3 bg-amber-50 rounded-lg">
                    <Bed className="w-6 h-6 text-amber-500 mb-1" />
                    <p className="text-sm text-gray-500">Dormitorios</p>
                    <p className="font-semibold">{property.bedrooms || 'N/A'}</p>
                  </div>
                  
                  <div className="flex flex-col items-center p-3 bg-amber-50 rounded-lg">
                    <Bath className="w-6 h-6 text-amber-500 mb-1" />
                    <p className="text-sm text-gray-500">Baños</p>
                    <p className="font-semibold">{property.bathrooms || 'N/A'}</p>
                  </div>
                  
                  <div className="flex flex-col items-center p-3 bg-amber-50 rounded-lg">
                    <SquareIcon className="w-6 h-6 text-amber-500 mb-1" />
                    <p className="text-sm text-gray-500">Superficie</p>
                    <p className="font-semibold">{property.area ? `${property.area} ${property.area_unit}` : 'N/A'}</p>
                  </div>
                  
                  <div className="flex flex-col items-center p-3 bg-amber-50 rounded-lg">
                    <Building className="w-6 h-6 text-amber-500 mb-1" />
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="font-semibold capitalize">{property.property_type}</p>
                  </div>
                </div>

                {/* Descripción */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">Descripción</h2>
                  <p className="text-slate-600 whitespace-pre-line">{property.description}</p>
                </div>

                {/* Mapa */}
                {property.latitude && property.longitude && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Ubicación</h2>
                    <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
                      <MapContainer
                        center={[property.latitude, property.longitude]}
                        zoom={15}
                        scrollWheelZoom={false}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker 
                          position={[property.latitude, property.longitude]}
                          icon={defaultIcon}
                        >
                          <Popup>
                            {property.address}
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel lateral - Contacto */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="border-t pt-4 mb-4">
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">Contactar</h3>
                  
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Información de contacto:</p>
                    {property.profile ? (
                      <>
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
                        
                        {/* Mostramos solo la información esencial de contacto */}
                        <div className="flex flex-col space-y-2 mb-6">
                          {/* Teléfono de contacto - siempre visible según el schema (NOT NULL) */}
                          <a 
                            href={`tel:${property.profile.contact_phone}`}
                            className="flex items-center text-gray-600 hover:text-amber-600"
                          >
                            <Phone size={18} className="mr-2" />
                            <span>{property.profile.contact_phone}</span>
                          </a>
                          
                          {/* Email de contacto - siempre visible según el schema (NOT NULL) */}
                          <a 
                            href={`mailto:${property.profile.contact_email}`}
                            className="flex items-center text-gray-600 hover:text-amber-600"
                          >
                            <Mail size={18} className="mr-2" />
                            <span>{property.profile.contact_email}</span>
                          </a>
                          
                          {/* WhatsApp - solo si está disponible */}
                          {property.profile.whatsapp_number && (
                            <a 
                              href={`https://wa.me/${property.profile.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola, estoy interesado/a en la propiedad "${property.title}" (Ref: ${property.id}). ¿Podría proporcionarme más información?`)}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center text-gray-600 hover:text-green-600"
                            >
                              <MessageCircle size={18} className="mr-2" />
                              <span>WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col space-y-2 mb-6">
                        <p className="text-sm text-gray-600 mb-3">Información de contacto no disponible</p>
                      </div>
                    )}
                  </div>
                  
                  <ContactForm 
                    propertyId={property.id} 
                    propertyTitle={property.title}
                    source="website"
                    propertyPhone={property.profile?.whatsapp_number || property.profile?.contact_phone}
                    enableWhatsAppButton={true}
                  />
                  <div className="border-t pt-4 mt-6">
                    <button
                      onClick={() => {
                        // Copiar la URL al portapapeles
                        navigator.clipboard.writeText(window.location.href)
                          .then(() => {
                            showToast('URL copiada al portapapeles', 'success');
                          })
                          .catch(() => {
                            showToast('No se pudo copiar la URL', 'error');
                          });
                      }}
                      className="flex items-center justify-center w-full border border-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <Share2 size={18} className="mr-2" />
                      Compartir propiedad
                    </button>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`Mira esta propiedad: ${window.location.href}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => showToast('Abriendo WhatsApp para compartir', 'info')}
                      className="flex flex-1 items-center justify-center bg-green-500 text-white font-medium py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => showToast('Abriendo Facebook para compartir', 'info')}
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
    </div>
  );
};

// Exportación explícita del componente
export default PropertyDetail;