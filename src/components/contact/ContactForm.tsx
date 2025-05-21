import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LeadSource } from '../../types';
import { createLead } from '../../lib/api';
import { generateWhatsAppLink } from '../../lib/whatsappService';
import { useToast } from '../../context/useToast';

interface ContactFormProps {
  propertyId?: string;
  propertyTitle?: string;
  source?: LeadSource;
  onSuccess?: () => void;
  propertyPhone?: string;
  enableWhatsAppButton?: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  propertyId,
  propertyTitle,
  source = 'website',
  onSuccess,
  propertyPhone,
  enableWhatsAppButton = true
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: propertyId && propertyTitle 
      ? `Me interesa la propiedad "${propertyTitle}" (Referencia: ${propertyId}). Por favor contáctenme para más información.`
      : ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    try {
      // Si el usuario no está autenticado, no podemos guardar el lead
      // Podríamos implementar una solución para crear un usuario anónimo o un sistema alternativo
      const userId = user?.id;
      
      if (!userId) {
        throw new Error('Debes iniciar sesión para enviar el formulario');
      }

      // Crear un lead utilizando nuestra función de API actualizada que incluye notificaciones
      await createLead({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        property_id: propertyId || null,
        user_id: userId,
        source: source
      });
      
      // Reiniciar el formulario
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      setSuccess(true);
      
      // Mostrar notificación toast de éxito
      showToast('¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.', 'success');
      
      // Llamar al callback de éxito si existe
      if (onSuccess) onSuccess();
      
    } catch (err) {
      console.error('Error al enviar formulario:', err);
      const errorMessage = err instanceof Error ? err.message : 'Ha ocurrido un error al enviar el formulario';
      setError(errorMessage);
      
      // Mostrar notificación toast de error
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Función para manejar el clic en el botón de WhatsApp
  const handleWhatsAppClick = () => {
    if (!propertyPhone) return;
    
    const whatsAppMessage = propertyTitle 
      ? `Hola, estoy interesado/a en la propiedad "${propertyTitle}" (Referencia: ${propertyId}). ¿Podría proporcionarme más información?`
      : "Hola, me gustaría obtener información sobre sus propiedades.";
      
    // Abre WhatsApp en una nueva ventana
    window.open(generateWhatsAppLink(propertyPhone, whatsAppMessage), '_blank');
    
    // Mostrar notificación toast informativa
    showToast('Abriendo WhatsApp para contactar al agente...', 'info');
  };

  return (
    <div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
        {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          ¡Gracias por contactarnos! Nos pondremos en contacto contigo lo antes posible.
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              ></textarea>
            </div>
            
            <div className="flex flex-col space-y-3">
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-amber-500 text-white font-medium py-2 px-4 rounded-md hover:bg-amber-600 transition-colors ${
                  loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
              
              {enableWhatsAppButton && propertyPhone && (
                <button
                  type="button"
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-500 text-white font-medium py-2 px-4 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="mr-2"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  Contactar por WhatsApp
                </button>
              )}
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ContactForm;
