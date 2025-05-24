import {
  Building,
  Bed,
  Bath,
  Square as SquareIcon,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Share2,
} from "lucide-react";
import { fetchPropertyById } from "../lib/api";
import { Property } from "../types";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { register } from "swiper/element/bundle";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./PropertyDetail.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import ContactForm from "../components/contact/ContactForm";
import { useToast } from "../context/useToast";
import { useState } from "react";

import VirtualTour from "../components/property/VirtualTour";
import MortgageCalculator from "../components/property/MortgageCalculator";
import NeighborhoodAnalytics from "../components/property/NeighborhoodAnalytics";
import NeighborhoodAnalyticsCard from "../components/property/NeighborhoodAnalyticsCard";
import PropertyComparison from "../components/property/PropertyComparison";

// Corrigiendo el problema de íconos de Leaflet en el entorno de React
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Configurar el ícono por defecto para los marcadores de Leaflet
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

register();

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  // Usamos React Query para gestionar el estado y la caché de los datos
  const {
    data: property,
    isLoading: loading,
    error,
  } = useQuery<Property, Error>({
    queryKey: ["property", id], // clave única para identificar esta consulta
    queryFn: () => {
      if (!id) throw new Error("No property ID provided");
      return fetchPropertyById(id);
    },
    staleTime: 1000 * 60 * 5, // 5 minutos antes de considerar los datos obsoletos
    enabled: !!id, // Solo ejecuta la consulta si hay un ID
  });

  const formatPrice = (price: number, currency: string) => {
    if (currency === "UF") {
      return `UF ${price.toLocaleString("es-CL")}`;
    }
    return `CLP ${price.toLocaleString("es-CL")}`;
  };
  const [activeTab, setActiveTab] = useState<
    "info" | "virtual" | "calculator" | "analytics" | "comparison"
  >("info");

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
          <p>
            {error instanceof Error ? error.message : "Propiedad no encontrada"}
          </p>
          <Link
            to="/"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "info", label: "Información" },
    { id: "virtual", label: "Tour Virtual" },
    { id: "calculator", label: "Calculadora" },
    { id: "analytics", label: "Análisis" },
    { id: "comparison", label: "Comparar" },
  ] as const;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center text-sm text-gray-600">
            <Link to="/" className="hover:text-amber-600">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <Link
              to={`/categoria/${property.property_type}`}
              className="hover:text-amber-600"
            >
              {property.property_type.charAt(0).toUpperCase() +
                property.property_type.slice(1)}
              s
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium">{property.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              {/* Image Gallery */}{" "}
              {property.images && property.images.length > 0 ? (
                <div className="relative h-96 overflow-hidden">
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
                          className="w-full h-full object-cover rounded-lg"
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
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b">
                <nav className="flex">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-3 text-sm font-medium border-b-2 ${
                        activeTab === tab.id
                          ? "border-amber-500 text-amber-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "info" && (
                  <div>
                    <div className="flex flex-wrap justify-between items-start mb-4">
                      <h1 className="text-2xl font-bold text-slate-800 mb-2 md:mb-0">
                        {property.title}
                      </h1>
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
                        <p className="font-semibold">
                          {property.bedrooms || "N/A"}
                        </p>
                      </div>

                      <div className="flex flex-col items-center p-3 bg-amber-50 rounded-lg">
                        <Bath className="w-6 h-6 text-amber-500 mb-1" />
                        <p className="text-sm text-gray-500">Baños</p>
                        <p className="font-semibold">
                          {property.bathrooms || "N/A"}
                        </p>
                      </div>

                      <div className="flex flex-col items-center p-3 bg-amber-50 rounded-lg">
                        <SquareIcon className="w-6 h-6 text-amber-500 mb-1" />
                        <p className="text-sm text-gray-500">Superficie</p>
                        <p className="font-semibold">
                          {property.area
                            ? `${property.area} ${property.area_unit}`
                            : "N/A"}
                        </p>
                      </div>

                      <div className="flex flex-col items-center p-3 bg-amber-50 rounded-lg">
                        <Building className="w-6 h-6 text-amber-500 mb-1" />
                        <p className="text-sm text-gray-500">Tipo</p>
                        <p className="font-semibold capitalize">
                          {property.property_type}
                        </p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-slate-800 mb-4">
                        Descripción
                      </h2>

                      <div
                        className="prose max-w-none text-gray-600"
                        dangerouslySetInnerHTML={{
                          __html: property.description,
                        }}
                      />
                    </div>
                    <div className="mb-8">
                      {/* Mapa */}
                      {property.latitude && property.longitude && (
                        <div className="mb-8">
                          <h2 className="text-xl font-semibold text-slate-800 mb-4">
                            Ubicación
                          </h2>
                          <div className="h-64 rounded-lg overflow-hidden border border-gray-200">
                            <MapContainer
                              center={[property.latitude, property.longitude]}
                              zoom={15}
                              scrollWheelZoom={false}
                              style={{ height: "100%", width: "100%" }}
                            >
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <Marker
                                position={[
                                  property.latitude,
                                  property.longitude,
                                ]}
                                icon={defaultIcon}
                              >
                                <Popup>{property.address}</Popup>
                              </Marker>
                            </MapContainer>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Características adicionales de la propiedad */}
                    <div className="mb-8">
                      <h2 className="text-xl font-semibold text-slate-800 mb-4">
                        Características de la Propiedad
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {property.year_built && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span className="text-gray-600">
                              Año de construcción: {property.year_built}
                            </span>
                          </div>
                        )}

                        {property.parking_spaces !== undefined && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span className="text-gray-600">
                              Estacionamientos: {property.parking_spaces}
                            </span>
                          </div>
                        )}

                        {property.floor_number !== undefined && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span className="text-gray-600">
                              Piso N°: {property.floor_number}
                            </span>
                          </div>
                        )}

                        {property.total_floors !== undefined && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span className="text-gray-600">
                              Total pisos: {property.total_floors}
                            </span>
                          </div>
                        )}

                        {property.maintenance_fee != null && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span className="text-gray-600">
                              Gastos comunes:{" "}
                              {property.currency === "UF"
                                ? `UF ${property.maintenance_fee}`
                                : `$${Number(
                                    property.maintenance_fee
                                  ).toLocaleString("es-CL")}`}
                            </span>
                          </div>
                        )}

                        {property.energy_rating && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span className="text-gray-600">
                              Certificación energética: {property.energy_rating}
                            </span>
                          </div>
                        )}

                        {property.construction_status && (
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span className="text-gray-600">
                              Estado:
                              {property.construction_status === "terminado" &&
                                " Terminado"}
                              {property.construction_status ===
                                "en_construccion" && " En construcción"}
                              {property.construction_status === "en_plano" &&
                                " En plano"}
                              {property.construction_status === "por_renovar" &&
                                " Por renovar"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botón para ver el tour virtual si existe */}
                    {property.virtual_tour_url && (
                      <div className="mb-8">
                        <button
                          onClick={() => setActiveTab("virtual")}
                          className="flex items-center justify-center px-4 py-2 rounded-md bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Ver tour virtual de la propiedad
                        </button>
                      </div>
                    )}
                  </div>
                )}{" "}
                {activeTab === "virtual" && (
                  <VirtualTour
                    tourUrl={property.virtual_tour_url}
                    title={property.title}
                  />
                )}
                {activeTab === "calculator" && (
                  <MortgageCalculator
                    propertyPrice={property.price}
                    currency={property.currency}
                  />
                )}
                {activeTab === "analytics" && (
                  <>
                    {/* Estadísticas del vecindario usando nuestro nuevo componente */}
                    <NeighborhoodAnalyticsCard
                      neighborhoodData={{
                        schools_nearby: property.schools_nearby,
                        shops_nearby: property.shops_nearby,
                        transport_nearby: property.transport_nearby,
                        green_areas_nearby: property.green_areas_nearby,
                        services_nearby: property.services_nearby,
                        avg_square_meter_price: property.avg_square_meter_price,
                        annual_value_increase: property.annual_value_increase,
                        security_index: property.security_index,
                        life_quality_index: property.life_quality_index,
                        demographics: property.demographics,
                      }}
                      currency={property.currency}
                    />
                  </>
                )}
                {activeTab === "comparison" && (
                  <PropertyComparison currentPropertyId={property.id} />
                )}
              </div>
            </div>
          </div>

          {/* Panel lateral - Contacto */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="border-t pt-4 mb-4">
                  <h3 className="text-xl font-semibold text-slate-800 mb-4">
                    Contactar
                  </h3>

                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">
                      Información de contacto:
                    </p>
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
                            <p className="font-medium">
                              {property.profile.company_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Agente Inmobiliario
                            </p>
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
                              href={`https://wa.me/${property.profile.whatsapp_number.replace(
                                /[^0-9]/g,
                                ""
                              )}?text=${encodeURIComponent(
                                `Hola, estoy interesado/a en la propiedad "${property.title}" (Ref: ${property.id}). ¿Podría proporcionarme más información?`
                              )}`}
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
                        <p className="text-sm text-gray-600 mb-3">
                          Información de contacto no disponible
                        </p>
                      </div>
                    )}
                  </div>

                  <ContactForm
                    propertyId={property.id}
                    propertyTitle={property.title}
                    source="website"
                    propertyPhone={
                      property.profile?.whatsapp_number ||
                      property.profile?.contact_phone
                    }
                    enableWhatsAppButton={true}
                  />
                  <div className="border-t pt-4 mt-6">
                    <button
                      onClick={() => {
                        // Copiar la URL al portapapeles
                        navigator.clipboard
                          .writeText(window.location.href)
                          .then(() => {
                            showToast("URL copiada al portapapeles", "success");
                          })
                          .catch(() => {
                            showToast("No se pudo copiar la URL", "error");
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
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Mira esta propiedad: ${window.location.href}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        showToast("Abriendo WhatsApp para compartir", "info")
                      }
                      className="flex flex-1 items-center justify-center bg-green-500 text-white font-medium py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        window.location.href
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        showToast("Abriendo Facebook para compartir", "info")
                      }
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

export default PropertyDetail;
