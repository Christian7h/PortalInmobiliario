import { useQuery } from '@tanstack/react-query';
import { fetchCompanyProfile, fetchTeamMembers } from '../lib/api';
import { CompanyProfile, TeamMember } from '../types';
import { MapPin, Mail, Phone, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import './about.css'; // Importamos estilos específicos para esta página

function About() {
  // Utilizamos useQuery para memorizar la consulta del perfil de empresa
  const { 
    data: companyProfile, 
    isLoading: profileLoading, 
    error: profileError 
  } = useQuery<CompanyProfile, Error>({
    queryKey: ['companyProfile'], // clave única para identificar esta consulta en la caché
    queryFn: fetchCompanyProfile,
    staleTime: 1000 * 60 * 10, // 10 minutos antes de considerar los datos obsoletos
  });
  
  // Utilizamos useQuery para obtener los miembros del equipo
  const {
    data: teamMembers = [],
    isLoading: teamLoading,
    error: teamError
  } = useQuery<TeamMember[], Error>({
    queryKey: ['teamMembers'],
    queryFn: fetchTeamMembers,
    staleTime: 1000 * 60 * 10, // 10 minutos antes de considerar los datos obsoletos
  });
  
  // Estado de carga general
  const loading = profileLoading || teamLoading;
  // Error general
  const error = profileError || teamError;

  // Si hay un error en la consulta, mostramos un mensaje
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: No se pudo cargar la información de la empresa.
        </div>
      </div>
    );
  }

  return (
    <div className="about-container py-12">
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <>
          {/* Hero Section con estilo Apple */}
          <section className="hero-section">
            <div className="hero-pattern"></div>
            <div className="hero-content">
              <h1 className="hero-title">Sobre Nosotros</h1>
              <p className="hero-subtitle">
                {companyProfile?.years_experience 
                  ? `Con ${companyProfile.years_experience} años de experiencia en el mercado inmobiliario, ofreciendo soluciones habitacionales a la medida de tus necesidades.`
                  : "Con años de experiencia en el mercado inmobiliario, brindando asesoría personalizada para encontrar la propiedad de tus sueños."}
              </p>
            </div>
          </section>
          
          {/* Información general con diseño moderno */}
          <section className="section">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-8 text-slate-800">Nuestra Historia</h2>
                {companyProfile?.history ? (
                  <div dangerouslySetInnerHTML={{ __html: companyProfile.history.replace(/\n/g, '<br>') }} className="text-lg leading-relaxed text-gray-600" />
                ) : companyProfile?.description ? (
                  <div dangerouslySetInnerHTML={{ __html: companyProfile.description.replace(/\n/g, '<br>') }} className="text-lg leading-relaxed text-gray-600" />
                ) : (
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Somos una empresa inmobiliaria comprometida con brindar el mejor servicio a nuestros clientes.
                    Nos especializamos en la compra, venta y arriendo de propiedades en las mejores ubicaciones.
                  </p>
                )}
              </div>
              
              {companyProfile?.logo_url ? (
                <div className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 shadow-lg overflow-hidden">
                  <img 
                  src={companyProfile.logo_url} 
                  alt={`Logo de ${companyProfile.company_name || 'nuestra empresa'}`}
                  className="max-h-80 max-w-full object-contain filter invert" 
                  style={{ filter: "invert(100%)" }}
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center p-12 shadow-lg">
                  <p className="text-gray-400 text-center italic">Imagen corporativa no disponible</p>
                </div>
              )}
            </div>
          </section>
          
          {/* Misión, Visión y Valores con estilo vidrio esmerilado */}
          {(companyProfile?.mission || companyProfile?.vision || companyProfile?.values) && (
            <section className="section">
              <h2 className="section-title">Nuestra Filosofía</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {companyProfile?.mission && (
                  <div className="value-card">
                    <h3>Misión</h3>
                    <div dangerouslySetInnerHTML={{ __html: companyProfile.mission.replace(/\n/g, '<br>') }} className="text-gray-600 leading-relaxed" />
                  </div>
                )}
                
                {companyProfile?.vision && (
                  <div className="value-card">
                    <h3>Visión</h3>
                    <div dangerouslySetInnerHTML={{ __html: companyProfile.vision.replace(/\n/g, '<br>') }} className="text-gray-600 leading-relaxed" />
                  </div>
                )}
                
                {companyProfile?.values && (
                  <div className="value-card">
                    <h3>Valores</h3>
                    <div dangerouslySetInnerHTML={{ __html: companyProfile.values.replace(/\n/g, '<br>') }} className="text-gray-600 leading-relaxed" />
                  </div>
                )}
              </div>
            </section>
          )}
          
          {/* Equipo con diseño elegante y minimalista */}
          {teamMembers && teamMembers.length > 0 && (
            <section className="section">
              <h2 className="section-title">Nuestro Equipo</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {teamMembers.map(member => (
                  <div key={member.id} className="team-member-card">
                    {member.photo_url ? (
                      <div className="photo-container">
                        <img 
                          src={member.photo_url} 
                          alt={`Foto de ${member.name}`}
                        />
                      </div>
                    ) : (
                      <div className="photo-container bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-lg">Sin foto</span>
                      </div>
                    )}
                    <div className="info">
                      <h3 className="name">{member.name}</h3>
                      <p className="position">{member.position}</p>
                      {member.bio && (
                        <p className="bio">{member.bio}</p>
                      )}
                      <div className="social-links">
                        {member.email && (
                          <a 
                            href={`mailto:${member.email}`} 
                            aria-label={`Email de ${member.name}`}
                          >
                            <Mail size={20} />
                          </a>
                        )}
                        {member.linkedin_url && (
                          <a 
                            href={member.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label={`LinkedIn de ${member.name}`}
                          >
                            <Linkedin size={20} />
                          </a>
                        )}
                        {member.twitter_url && (
                          <a 
                            href={member.twitter_url}
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label={`Twitter de ${member.name}`}
                          >
                            <Twitter size={20} />
                          </a>
                        )}
                        {member.instagram_url && (
                          <a 
                            href={member.instagram_url}
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label={`Instagram de ${member.name}`}
                          >
                            <Instagram size={20} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* Información de Contacto con diseño minimalista */}
          {companyProfile && (
            <section className="section">
              <h2 className="section-title">Información de Contacto</h2>
              <div className="contact-section">
                <div className="grid md:grid-cols-2 gap-10">
                  <div>
                    <div className="contact-item">
                      <MapPin className="contact-icon" size={22} />
                      <div className="contact-info">
                        <h3>Dirección</h3>
                        <p>{companyProfile.address || "Dirección no disponible"}</p>
                      </div>
                    </div>
                    
                    <div className="contact-item">
                      <Phone className="contact-icon" size={22} />
                      <div className="contact-info">
                        <h3>Teléfono</h3>
                        <a href={`tel:${companyProfile.contact_phone}`}>
                          {companyProfile.contact_phone}
                        </a>
                      </div>
                    </div>
                    
                    <div className="contact-item">
                      <Mail className="contact-icon" size={22} />
                      <div className="contact-info">
                        <h3>Correo Electrónico</h3>
                        <a href={`mailto:${companyProfile.contact_email}`}>
                          {companyProfile.contact_email}
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-semibold mb-6">Síguenos en redes sociales</h3>
                    <div className="flex flex-wrap gap-5 mt-4">
                      {companyProfile.facebook_url && (
                        <a 
                          href={companyProfile.facebook_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="social-button"
                          aria-label="Facebook"
                        >
                          <Facebook />
                        </a>
                      )}
                      
                      {companyProfile.instagram_url && (
                        <a 
                          href={companyProfile.instagram_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="social-button"
                          aria-label="Instagram"
                        >
                          <Instagram />
                        </a>
                      )}
                      
                      {companyProfile.twitter_url && (
                        <a 
                          href={companyProfile.twitter_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="social-button"
                          aria-label="Twitter"
                        >
                          <Twitter />
                        </a>
                      )}
                      
                      {companyProfile.linkedin_url && (
                        <a 
                          href={companyProfile.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="social-button"
                          aria-label="LinkedIn"
                        >
                          <Linkedin />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default About;