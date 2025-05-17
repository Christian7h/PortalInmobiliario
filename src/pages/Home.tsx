// filepath: src/pages/Home.tsx
import { useState, useEffect } from 'react';
import { useQueries } from '@tanstack/react-query';
import PropertySearch from '../components/property/PropertySearch';
import FeaturedProperties from '../components/property/FeaturedProperties';
import PropertyCarousel from '../components/property/PropertyCarousel';
import type { Property, PropertyType } from '../types';
import { Building, Home as HomeIcon, Shield, MapPin, Zap, UserCheck } from 'lucide-react';
import { fetchPropertiesByCategory } from '../lib/api';

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
  // Utilizamos useQueries para hacer múltiples consultas en paralelo
  const categoryResults = useQueries({
    queries: propertyCategories.map(category => ({
      queryKey: ['properties', category.type],
      queryFn: () => fetchPropertiesByCategory(category.type),
      staleTime: 1000 * 60 * 5, // 5 minutos antes de considerar datos obsoletos
    }))
  });
  
  // Preparar los datos para usarlos en el componente
  const categoryProperties: Record<PropertyType, Property[]> = {} as Record<PropertyType, Property[]>;
  const loading = categoryResults.some(query => query.isLoading);
  
  // Asignar los resultados de las consultas al objeto categoryProperties
  categoryResults.forEach((result, index) => {
    if (result.data) {
      categoryProperties[propertyCategories[index].type] = result.data;
    } else {
      categoryProperties[propertyCategories[index].type] = [];
    }
  });  return (
    <>
      {/* Hero Section con estilo inspirado en Apple usando los colores del proyecto */}
      <section className="relative min-h-980vh] flex items-center justify-center overflow-hidden bg-[#f5f5f7] text-slate-800">
        {/* Fondo con patrón de puntos similar a about.css */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-full h-full" style={{
            backgroundImage: `linear-gradient(100deg, #f3f3f3 0%, #ffffff 100%)`
          }}></div>
          
          {/* Patrón de puntos similar al de about.css */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, #f59e0b 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
            opacity: 0.1
          }}></div>
          
          {/* Círculos decorativos con colores amber */}
          <div className="absolute -right-32 -top-32 w-96 h-96 bg-amber-100 rounded-full opacity-30"></div>
          <div className="absolute -left-20 bottom-10 w-64 h-64 bg-amber-50 rounded-full opacity-40"></div>
          <div className="absolute right-1/4 bottom-1/3 w-32 h-32 bg-amber-200 rounded-full opacity-30"></div>
        </div>
          <div className="container px-4 mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left order-2 md:order-1">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight text-slate-800">
                Encuentra la propiedad <span className="text-amber-500">perfecta</span> para tu vida
              </h1>
              <p className="text-lg md:text-xl mb-10 text-slate-600 max-w-xl">
                Descubre espacios excepcionales que se adaptan a tus sueños. Selección exclusiva de propiedades premium en las mejores ubicaciones.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="#propiedades" 
                  className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-8 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                >
                  Explorar propiedades
                </a>
                <a 
                  href="/contacto" 
                  className="bg-transparent hover:bg-slate-100 border border-slate-300 text-slate-800 font-medium py-3 px-8 rounded-full transition-all duration-300 hover:border-amber-500 hover:text-amber-600"
                >
                  Contactar asesor
                </a>
              </div>
            </div>
            
            <div className="relative order-1 md:order-2 mb-8 md:mb-0">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative transform transition-all duration-500 hover:scale-[1.02] hover:shadow-amber-200">
                <img 
                  src="/images/hero-property.jpg" 
                  alt="Propiedad destacada" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://placehold.co/800x800/f8fafc/94a3b8?text=Propiedad+Destacada';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>
              
              {/* Elemento flotante de información con estilo consistente */}
                <div className="absolute -bottom-6 md:bottom-20 sm:bottom-8 md:-left-6 -left-3  bg-white p-5 rounded-xl shadow-lg max-w-[250px] border border-amber-100">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                  <span className="text-sm text-slate-600 font-medium">Disponible ahora</span>
                </div>
                <h3 className="font-semibold text-slate-800">Casa de diseño contemporáneo</h3>
                <p className="text-amber-600 font-bold">$450,000</p>
                </div>
            </div>
          </div>
        </div>      </section>

      {/* Sección de búsqueda con ID para navegación */}
        <div id="buscador" className="relative z-20 mt-10 p-5 mb-5 sm:-mt-16 md:-mt-20 lg:-mt-24 md:mb-16 px-4">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto backdrop-blur-lg bg-white/90 rounded-2xl p-8 shadow-xl border border-slate-100">
            <h2 className="text-2xl font-semibold text-center text-slate-800 mb-6">Encuentra tu propiedad ideal</h2>
            <PropertySearch />
          </div>
        </div>
      </div>      <div id="propiedades" className="py-20 bg-gradient-to-b from-white to-slate-50">
        {loading ? (
          <div className="container mx-auto px-4 py-12">
            <div className="flex justify-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-4">            <div className="mb-24">
              {/* Utilizamos el componente FeaturedProperties directamente */}
              <div className="mb-4">
                <h2 className="text-3xl text-slate-800 font-bold">
                  Propiedades <span className="text-amber-500">Destacadas</span>
                </h2>
              </div>
              <FeaturedProperties />
            </div>
            
            <div className="space-y-20">
              {propertyCategories.map((category) => {
                const properties = categoryProperties[category.type];
                
                if (!properties || properties.length === 0) return null;
                
                return (
                  <div key={category.type} className="overflow-visible relative">
                    <PropertyCarousel
                      properties={properties}
                      title={category.label}
                      viewAllLink={`/categoria/${category.type}`}
                      slidesPerView={4}
                    />
                  </div>
                );
              })}
      </div>
          </div>
        )}      </div>

      {/* Sección "Por qué elegirnos" con estilo del proyecto */}
      <section className="py-20 bg-[#f5f5f7] relative overflow-hidden">
        {/* Patrón de fondo sutíl */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, #f59e0b 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          opacity: 0.07
        }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 text-center mb-4">
              ¿Por qué <span className="text-amber-500">elegirnos</span>?
            </h2>
            <p className="text-slate-600 text-lg text-center max-w-2xl mx-auto">
              Nuestra atención meticulosa al detalle y nuestro servicio personalizado nos distingue en el mercado inmobiliario.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 xl:gap-12">
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-100 hover:shadow-lg hover:border-amber-100 transition-all duration-300 transform hover:scale-[1.02]">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-xl">
                  <HomeIcon className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Selección exclusiva</h3>
              <p className="text-slate-600">
                Propiedades cuidadosamente seleccionadas que cumplen con nuestros altos estándares de calidad y diseño.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-100 hover:shadow-lg hover:border-amber-100 transition-all duration-300 transform hover:scale-[1.02]">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-xl">
                  <MapPin className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Localización privilegiada</h3>
              <p className="text-slate-600">
                Información detallada sobre el entorno y servicios cercanos para ayudarte a tomar la mejor decisión.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-100 hover:shadow-lg hover:border-amber-100 transition-all duration-300 transform hover:scale-[1.02]">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-xl">
                  <UserCheck className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Asesoramiento personal</h3>
              <p className="text-slate-600">
                Un equipo de profesionales dedicados a guiarte en cada paso del proceso de compra o venta.
              </p>
            </div>
              {/* Segunda fila */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-100 hover:shadow-lg hover:border-amber-100 transition-all duration-300 transform hover:scale-[1.02]">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-xl">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Seguridad garantizada</h3>
              <p className="text-slate-600">
                Verificamos todas las propiedades y documentos para asegurar transacciones transparentes y seguras.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-100 hover:shadow-lg hover:border-amber-100 transition-all duration-300 transform hover:scale-[1.02]">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-xl">
                  <Building className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Adaptado a tus necesidades</h3>
              <p className="text-slate-600">
                Filtros avanzados que te permiten encontrar propiedades que se ajusten exactamente a tus requerimientos.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md border border-slate-100 hover:shadow-lg hover:border-amber-100 transition-all duration-300 transform hover:scale-[1.02]">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-xl">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-3">Respuesta ágil</h3>
              <p className="text-slate-600">
                Sistema eficiente de comunicación para que puedas obtener respuestas rápidas a todas tus consultas.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Sección de testimonios */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Lo que dicen nuestros <span className="text-amber-500">clientes</span>
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                La satisfacción de nuestros clientes es nuestro mejor testimonio. Descubre por qué confían en nosotros.
              </p>
            </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-50 p-8 rounded-xl shadow-md border border-slate-100 hover:shadow-lg hover:border-amber-100 transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex gap-1 mb-4 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 mb-6 italic">
                  "El proceso de compra fue increíblemente sencillo. El asesor entendió perfectamente nuestras necesidades y nos presentó opciones que realmente se ajustaban a lo que buscábamos."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-semibold mr-3">
                    MR
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">María Rodríguez</h4>
                    <p className="text-sm text-slate-500">Compró una casa en Santiago</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-8 rounded-xl shadow-md border border-slate-100 hover:shadow-lg hover:border-amber-100 transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex gap-1 mb-4 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 mb-6 italic">
                  "La atención personalizada y la transparencia durante la negociación marcaron la diferencia. Definitivamente, volveré a contar con sus servicios en el futuro."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-semibold mr-3">
                    JL
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">Jorge López</h4>
                    <p className="text-sm text-slate-500">Vendió un departamento</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-8 rounded-xl shadow-md border border-slate-100 hover:shadow-lg hover:border-amber-100 transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex gap-1 mb-4 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 mb-6 italic">
                  "La plataforma es muy intuitiva y la calidad de las fotos e información de las propiedades es excepcional. Encontré mi oficina ideal en tiempo récord."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-semibold mr-3">
                    AC
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">Ana Correa</h4>
                    <p className="text-sm text-slate-500">Arrendó una oficina comercial</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA final */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Patrón de puntos similar al de about.css pero más sutil */}
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, #f59e0b 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>
        
        {/* Círculos decorativos con colores ámbar */}
        <div className="absolute top-1/4 -right-40 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-20 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Encuentra tu hogar ideal <span className="text-amber-500">hoy mismo</span>
            </h2>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
              Nuestro equipo de expertos está listo para ayudarte a encontrar la propiedad perfecta para ti y tu familia.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="/propiedades" 
                className="bg-amber-500 hover:bg-amber-600 text-white font-medium py-3.5 px-8 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              >
                Ver todas las propiedades
              </a>
              <a 
                href="/contacto" 
                className="bg-transparent border border-white/30 hover:bg-white/10 text-white font-medium py-3.5 px-8 rounded-full transition-all duration-300 transform hover:scale-[1.02]"
              >
                Contactar a un asesor
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
