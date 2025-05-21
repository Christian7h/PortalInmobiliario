// filepath: src/pages/Contact.tsx
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCompanyProfile } from '../lib/api';
import { CompanyProfile } from '../types';
import ContactForm from '../components/contact/ContactForm';

const Contact = () => {
  // Usamos useQuery para obtener y memorizar el perfil de la empresa
  const { 
    data: companyProfile, 
    isLoading: profileLoading, 
    error: profileError 
  } = useQuery<CompanyProfile, Error>({
    queryKey: ['companyProfile'],
    queryFn: fetchCompanyProfile,
    staleTime: 1000 * 60 * 15, // 15 minutos antes de considerar los datos obsoletos
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contáctanos</h1>
        <p className="text-lg text-gray-600">Estamos aquí para ayudarte con todas tus necesidades inmobiliarias</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Información de Contacto</h2>
          
          {profileLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : profileError ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
              No se pudo cargar la información de contacto.
            </div>
          ) : (
            <div className="space-y-6">
              {companyProfile?.address && (
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 text-amber-600 mr-4" />
                  <div>
                    <p className="font-medium">Dirección</p>
                    <p className="text-gray-600">{companyProfile.address}</p>
                  </div>
                </div>
              )}

              {companyProfile?.contact_phone && (
                <div className="flex items-center">
                  <Phone className="h-6 w-6 text-amber-600 mr-4" />
                  <div>
                    <p className="font-medium">Teléfono</p>
                    <p className="text-gray-600">{companyProfile.contact_phone}</p>
                    {companyProfile?.whatsapp_number && (
                      <p className="text-gray-600">WhatsApp: {companyProfile.whatsapp_number}</p>
                    )}
                  </div>
                </div>
              )}

              {companyProfile?.contact_email && (
                <div className="flex items-center">
                  <Mail className="h-6 w-6 text-amber-600 mr-4" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">{companyProfile.contact_email}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Envíanos un Mensaje</h2>
          <ContactForm source="website" />
        </div>
      </div>
    </div>
  );
};

export default Contact;
