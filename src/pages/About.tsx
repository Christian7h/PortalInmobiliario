import { useQuery } from '@tanstack/react-query';
import { fetchCompanyProfile } from '../lib/api';
import { CompanyProfile } from '../types';

function About() {
  // Utilizamos useQuery para memorizar la consulta
  const { 
    data: companyProfile, 
    isLoading: loading, 
    error 
  } = useQuery<CompanyProfile, Error>({
    queryKey: ['companyProfile'], // clave única para identificar esta consulta en la caché
    queryFn: fetchCompanyProfile,
    staleTime: 1000 * 60 * 10, // 10 minutos antes de considerar los datos obsoletos
  });

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
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <>
          <h1 className="text-4xl font-bold mb-6">Sobre Nosotros</h1>
          <div className="prose max-w-none">
            {companyProfile?.description ? (
              <div dangerouslySetInnerHTML={{ __html: companyProfile.description.replace(/\n/g, '<br>') }} className="text-lg mb-4" />
            ) : (
              <>
                <p className="text-lg mb-4">
                  Somos una empresa inmobiliaria comprometida con brindar el mejor servicio a nuestros clientes.
                  Nos especializamos en la compra, venta y arriendo de propiedades en las mejores ubicaciones.
                </p>
                <p className="text-lg mb-4">
                  Con años de experiencia en el mercado inmobiliario, nuestro equipo de profesionales está
                  preparado para asesorarte en cada paso del proceso.
                </p>
              </>
            )}
          </div>
          
          {companyProfile && (
            <div className="mt-8 grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4 text-amber-600">Información de Contacto</h2>
                <ul className="space-y-3">
                  {companyProfile.company_name && (
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">Empresa:</span>
                      <span>{companyProfile.company_name}</span>
                    </li>
                  )}
                  {companyProfile.address && (
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">Dirección:</span>
                      <span>{companyProfile.address}</span>
                    </li>
                  )}
                  {companyProfile.contact_email && (
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">Email:</span>
                      <a href={`mailto:${companyProfile.contact_email}`} className="text-blue-600 hover:underline">
                        {companyProfile.contact_email}
                      </a>
                    </li>
                  )}
                  {companyProfile.contact_phone && (
                    <li className="flex items-start">
                      <span className="font-semibold mr-2">Teléfono:</span>
                      <a href={`tel:${companyProfile.contact_phone}`} className="text-blue-600 hover:underline">
                        {companyProfile.contact_phone}
                      </a>
                    </li>
                  )}
                </ul>
              </div>
              
              {companyProfile.logo_url && (
                <div className="flex items-center justify-center">
                  <img 
                    src={companyProfile.logo_url} 
                    alt={`Logo de ${companyProfile.company_name}`}
                    className="max-h-64 max-w-full object-contain" 
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default About;