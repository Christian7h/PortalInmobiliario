import { useParams, Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square as SquareFoot, Phone, Mail, Share2, Building } from 'lucide-react';
import type { Property } from '../types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { register } from 'swiper/element/bundle';
import L from 'leaflet';
import { useQuery } from '@tanstack/react-query';
import { fetchPropertyById } from '../lib/api';
import './PropertyDetail.css';

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
            <div className="bg-white rounded-lg shadow-md overflow-hidden relative">
              {/* Image Gallery */}
              {property.images && property.images.length > 0 ? (
                <div className="relative property-detail-gallery">
                  {/* Reemplazamos la altura fija por diseño responsive */}
                  <div className="w-full aspect-[16/9] md:aspect-[16/10] lg:aspect-[16/8] relative">
                    <swiper-container
                      navigation="true"
                      pagination="true"
                      className="h-full w-full absolute inset-0"
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
              ) : (
                <div className="w-full aspect-[16/9] md:aspect-[16/10] lg:aspect-[16/8] bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No hay imágenes disponibles</p>
                </div>
              )}

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
                         property.publication_status === 'arrendado' ? 'Arrendado' : 'Vendido'}
                      </span>
                    </div>
                  </div>
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

                {/* Location Map */}
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-800 mb-4">Ubicación</h2>
                  {property.latitude && property.longitude ? (
                    <div className="h-80 rounded-lg overflow-hidden">
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
                            <strong>{property.title}</strong><br />
                            {property.address}, {property.city}
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  ) : (
                    <div className="bg-gray-100 h-80 rounded-lg flex items-center justify-center text-gray-500">
                      <p>No hay datos de ubicación disponibles</p>
                    </div>
                  )}
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
                          href={`https://wa.me/${property.profile.whatsapp_number.replace(/[^0-9]/g, '')}`} 
                          className="flex items-center text-green-500 hover:text-green-700"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z"/>
                          </svg>
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
              
              <form className="mb-6" onSubmit={(e) => {
                e.preventDefault();
                // En una implementación real, aquí enviarías el formulario a un backend
                alert('Mensaje enviado. Te contactaremos pronto.');
              }}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
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
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    defaultValue={`Hola ${property.profile?.company_name || ''}. Me interesa la propiedad "${property.title}" ubicada en ${property.address}, ${property.city} (Referencia: ${property.id}). Me gustaría recibir más información.`}
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