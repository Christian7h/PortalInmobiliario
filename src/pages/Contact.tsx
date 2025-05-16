// filepath: src/pages/Contact.tsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchCompanyProfile } from '../lib/api';
import { CompanyProfile } from '../types';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Aquí puedes implementar el envío del formulario (por ejemplo, a través de un servicio de correo electrónico)
    try {
      // Simulación de envío
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch {
      setError('Ha ocurrido un error al enviar el mensaje. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

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
          
          {success ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
