import { Link } from 'react-router-dom';
import { Building, Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin, ChevronUp } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { CompanyProfile } from '../../types';

const Footer = () => {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Obtener el perfil de la empresa
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('company_profile')
          .select('*')
          .single();
        
        if (error) {
          console.error('Error fetching company profile:', error);
        } else {
          setCompanyProfile(data);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchCompanyProfile();
  }, []);

  // Control de visibilidad del botón "Volver arriba"
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Función para volver al inicio de la página con animación suave
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  return (
    <footer className="relative">
      {/* Botón para volver arriba */}
      <button 
        onClick={scrollToTop} 
        className={`fixed bottom-24 right-8 p-3 bg-amber-500/80 hover:bg-amber-500 text-white rounded-full shadow-lg backdrop-blur-md transition-all duration-300 z-50 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Volver arriba"
      >
        <ChevronUp size={24} />
      </button>

      {/* Parte superior del footer con efecto de vidrio */}
      <div className="bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-md text-white pt-16 pb-12 border-t border-slate-700/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            {/* Columna de información de la empresa - 4 columnas en md */}
            <div className="md:col-span-4">
              <Link to="/" className="flex items-center space-x-2 mb-6 group">
                {companyProfile?.logo_url ? (
                  <img src={companyProfile.logo_url} alt="Logo" className="h-10 w-auto transition-all duration-300 group-hover:scale-105" />
                ) : (
                  <Building className="h-10 w-10 text-amber-400 transition-all duration-300 group-hover:text-amber-300" />
                )}
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-amber-200 bg-clip-text text-transparent">
                  {companyProfile?.company_name || 'PropPortal'}
                </span>
              </Link>
              
              <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
                {companyProfile?.description || 
                  'Tu mejor opción para encontrar la propiedad ideal. Expertos en bienes raíces con años de experiencia en el mercado.'}
              </p>
              
              <div className="flex space-x-5 mb-6">
                {companyProfile?.facebook_url && (
                  <a href={companyProfile.facebook_url} target="_blank" rel="noopener noreferrer" 
                    className="text-gray-300 hover:text-amber-400 transition-all duration-300 hover:scale-110">
                    <Facebook size={20} />
                  </a>
                )}
                {companyProfile?.instagram_url && (
                  <a href={companyProfile.instagram_url} target="_blank" rel="noopener noreferrer" 
                    className="text-gray-300 hover:text-amber-400 transition-all duration-300 hover:scale-110">
                    <Instagram size={20} />
                  </a>
                )}
                {companyProfile?.twitter_url && (
                  <a href={companyProfile.twitter_url} target="_blank" rel="noopener noreferrer" 
                    className="text-gray-300 hover:text-amber-400 transition-all duration-300 hover:scale-110">
                    <Twitter size={20} />
                  </a>
                )}
                {companyProfile?.linkedin_url && (
                  <a href={companyProfile.linkedin_url} target="_blank" rel="noopener noreferrer" 
                    className="text-gray-300 hover:text-amber-400 transition-all duration-300 hover:scale-110">
                    <Linkedin size={20} />
                  </a>
                )}
              </div>

              {/* Información de contacto para móviles */}
              <div className="md:hidden space-y-3 mt-6">
                <h3 className="text-lg font-medium mb-3 text-amber-400">Contáctanos</h3>
                <address className="not-italic text-gray-300 space-y-3">
                  {companyProfile?.address && (
                    <div className="flex items-center">
                      <MapPin className="text-amber-400 mr-2 h-5 w-5" />
                      <span>{companyProfile.address}</span>
                    </div>
                  )}
                  {companyProfile?.contact_email && (
                    <div className="flex items-center">
                      <Mail className="text-amber-400 mr-2 h-5 w-5" />
                      <a href={`mailto:${companyProfile.contact_email}`} className="hover:text-amber-300 transition-colors">
                        {companyProfile.contact_email}
                      </a>
                    </div>
                  )}
                  {companyProfile?.contact_phone && (
                    <div className="flex items-center">
                      <Phone className="text-amber-400 mr-2 h-5 w-5" />
                      <a href={`tel:${companyProfile.contact_phone}`} className="hover:text-amber-300 transition-colors">
                        {companyProfile.contact_phone}
                      </a>
                    </div>
                  )}
                </address>
              </div>
            </div>
            
            {/* Columnas de navegación - cada una con 2 columnas en md */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-6 text-amber-400">Propiedades</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/categoria/casa" className="text-gray-300 hover:text-amber-300 transition-all duration-300 flex items-center group">
                    <span className="block w-0 group-hover:w-2 transition-all duration-300 h-[2px] bg-amber-400 mr-0 group-hover:mr-2"></span>
                    Casas
                  </Link>
                </li>
                <li>
                  <Link to="/categoria/departamento" className="text-gray-300 hover:text-amber-300 transition-all duration-300 flex items-center group">
                    <span className="block w-0 group-hover:w-2 transition-all duration-300 h-[2px] bg-amber-400 mr-0 group-hover:mr-2"></span>
                    Departamentos
                  </Link>
                </li>
                <li>
                  <Link to="/categoria/oficina" className="text-gray-300 hover:text-amber-300 transition-all duration-300 flex items-center group">
                    <span className="block w-0 group-hover:w-2 transition-all duration-300 h-[2px] bg-amber-400 mr-0 group-hover:mr-2"></span>
                    Oficinas
                  </Link>
                </li>
                <li>
                  <Link to="/categoria/local" className="text-gray-300 hover:text-amber-300 transition-all duration-300 flex items-center group">
                    <span className="block w-0 group-hover:w-2 transition-all duration-300 h-[2px] bg-amber-400 mr-0 group-hover:mr-2"></span>
                    Locales
                  </Link>
                </li>
                <li>
                  <Link to="/categoria/terreno" className="text-gray-300 hover:text-amber-300 transition-all duration-300 flex items-center group">
                    <span className="block w-0 group-hover:w-2 transition-all duration-300 h-[2px] bg-amber-400 mr-0 group-hover:mr-2"></span>
                    Terrenos
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-6 text-amber-400">Enlaces</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-gray-300 hover:text-amber-300 transition-all duration-300 flex items-center group">
                    <span className="block w-0 group-hover:w-2 transition-all duration-300 h-[2px] bg-amber-400 mr-0 group-hover:mr-2"></span>
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link to="/nosotros" className="text-gray-300 hover:text-amber-300 transition-all duration-300 flex items-center group">
                    <span className="block w-0 group-hover:w-2 transition-all duration-300 h-[2px] bg-amber-400 mr-0 group-hover:mr-2"></span>
                    Quiénes somos
                  </Link>
                </li>
                <li>
                  <Link to="/contacto" className="text-gray-300 hover:text-amber-300 transition-all duration-300 flex items-center group">
                    <span className="block w-0 group-hover:w-2 transition-all duration-300 h-[2px] bg-amber-400 mr-0 group-hover:mr-2"></span>
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Columna de contacto - 4 columnas en md, visible solo en escritorio */}
            <div className="hidden md:block md:col-span-4">
              <h3 className="text-lg font-medium mb-6 text-amber-400">Contáctanos</h3>
              <address className="not-italic text-gray-300 space-y-4">
                {companyProfile?.address && (
                  <div className="flex items-start">
                    <MapPin className="text-amber-400 mr-3 h-5 w-5 mt-1" />
                    <span className="leading-relaxed">{companyProfile.address}</span>
                  </div>
                )}
                {companyProfile?.contact_email && (
                  <div className="flex items-center">
                    <Mail className="text-amber-400 mr-3 h-5 w-5" />
                    <a href={`mailto:${companyProfile.contact_email}`} className="hover:text-amber-300 transition-colors">
                      {companyProfile.contact_email}
                    </a>
                  </div>
                )}
                {companyProfile?.contact_phone && (
                  <div className="flex items-center">
                    <Phone className="text-amber-400 mr-3 h-5 w-5" />
                    <a href={`tel:${companyProfile.contact_phone}`} className="hover:text-amber-300 transition-colors">
                      {companyProfile.contact_phone}
                    </a>
                  </div>
                )}
                {companyProfile?.whatsapp_number && (
                  <div className="mt-4 inline-block">
                    <a 
                      href={`https://wa.me/${companyProfile.whatsapp_number.replace(/[^\d+]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-full hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 inline-flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.345.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      WhatsApp
                    </a>
                  </div>
                )}
              </address>
            </div>
          </div>
        </div>
      </div>
      
      {/* Parte inferior del footer con copyright */}
      <div className="bg-slate-900 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm text-center md:text-left mb-4 md:mb-0">
              © {new Date().getFullYear()} <span className="text-amber-400">{companyProfile?.company_name || 'PropPortal'}</span>. 
              Todos los derechos reservados.
            </p>
            <div className="text-slate-400 text-sm">
              Diseñado con <span className="text-amber-400">♥</span> para una experiencia inmobiliaria excepcional
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;