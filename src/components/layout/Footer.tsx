import { Link } from 'react-router-dom';
import { Building, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { CompanyProfile } from '../../types';

const Footer = () => {
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

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

  return (
    <footer className="bg-slate-800 text-white pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              {companyProfile?.logo_url ? (
                <img src={companyProfile.logo_url} alt="Logo" className="h-8 w-auto" />
              ) : (
                <Building className="h-8 w-8 text-amber-400" />
              )}
              <span className="text-2xl font-bold">{companyProfile?.company_name || 'PropPortal'}</span>
            </Link>
            <p className="text-gray-300 mb-4">
              {companyProfile?.description || 
                'Tu mejor opción para encontrar la propiedad ideal. Expertos en bienes raíces con años de experiencia en el mercado.'}
            </p>
            <div className="flex space-x-4">
              {companyProfile?.facebook_url && (
                <a href={companyProfile.facebook_url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-amber-400 transition-colors">
                  <Facebook size={20} />
                </a>
              )}
              {companyProfile?.instagram_url && (
                <a href={companyProfile.instagram_url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-amber-400 transition-colors">
                  <Instagram size={20} />
                </a>
              )}
              {companyProfile?.twitter_url && (
                <a href={companyProfile.twitter_url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-amber-400 transition-colors">
                  <Twitter size={20} />
                </a>
              )}
              {companyProfile?.linkedin_url && (
                <a href={companyProfile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-amber-400 transition-colors">
                  <Linkedin size={20} />
                </a>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-amber-400">Propiedades</h3>
            <ul className="space-y-2">
              <li><Link to="/categoria/casa" className="text-gray-300 hover:text-white transition-colors">Casas</Link></li>
              <li><Link to="/categoria/departamento" className="text-gray-300 hover:text-white transition-colors">Departamentos</Link></li>
              <li><Link to="/categoria/oficina" className="text-gray-300 hover:text-white transition-colors">Oficinas</Link></li>
              <li><Link to="/categoria/local" className="text-gray-300 hover:text-white transition-colors">Locales</Link></li>
              <li><Link to="/categoria/terreno" className="text-gray-300 hover:text-white transition-colors">Terrenos</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-amber-400">Enlaces</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Inicio</Link></li>
              <li><Link to="/nosotros" className="text-gray-300 hover:text-white transition-colors">Quiénes somos</Link></li>
              <li><Link to="/contacto" className="text-gray-300 hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-4 text-amber-400">Contacto</h3>
            <address className="not-italic text-gray-300 space-y-2">
              {companyProfile?.address && <p>{companyProfile.address}</p>}
              {companyProfile?.contact_email && <p>Email: {companyProfile.contact_email}</p>}
              {companyProfile?.contact_phone && <p>Teléfono: {companyProfile.contact_phone}</p>}
              {companyProfile?.whatsapp_number && <p>WhatsApp: {companyProfile.whatsapp_number}</p>}
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-8">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} {companyProfile?.company_name || 'PropPortal'}. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;