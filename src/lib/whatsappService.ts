// whatsappService.ts - Servicio para la integración con WhatsApp
import { Lead, Property } from '../types';

/**
 * Función para generar un enlace de WhatsApp con mensaje predefinido
 */
export const generateWhatsAppLink = (
  phone: string, 
  message: string = ""
): string => {
  // Limpia el número telefónico (elimina espacios, paréntesis, guiones, etc.)
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  
  // Si el mensaje está vacío, simplemente devolvemos el enlace sin texto
  if (!message) {
    return `https://wa.me/${cleanPhone}`;
  }
  
  // Codifica el mensaje para URL
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

/**
 * Función para generar un mensaje predefinido para una propiedad
 */
export const generatePropertyWhatsAppMessage = (property: Property): string => {
  const propertyUrl = `${window.location.origin}/propiedad/${property.id}`;
  
  // Formato del mensaje
  return `Hola, estoy interesado/a en la propiedad "${property.title}" (${property.operation_type === 'venta' ? 'Venta' : 'Arriendo'} - ${property.price.toLocaleString('es-CL')} ${property.currency}). Me gustaría obtener más información. ${propertyUrl}`;
};

/**
 * Función para enviar un mensaje de WhatsApp basado en un lead
 */
export const sendLeadWhatsApp = (lead: Lead): void => {
  let message = `Hola, soy ${lead.name}. `;
  
  if (lead.property) {
    message += `Estoy interesado/a en la propiedad "${lead.property.title}". `;
  }
  
  message += lead.message;
  
  // Limpia el número telefónico del lead
  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
  
  // Abre WhatsApp en una nueva ventana
  window.open(generateWhatsAppLink(cleanPhone, message), '_blank');
};

/**
 * Función para crear un lead desde WhatsApp
 * Se utiliza cuando alguien hace clic en un botón de WhatsApp
 */
export const createLeadFromWhatsApp = async (
  propertyId: string, 
  propertyTitle: string, 
  userId: string,
  createLeadFn: Function // Función importada de api.ts
): Promise<void> => {
  try {
    // Recopilar información sobre el usuario desde el navegador (si está disponible)
    const userAgent = navigator.userAgent;
    const referrer = document.referrer;
    
    // Crear un lead con la información disponible
    await createLeadFn({
      name: "Cliente de WhatsApp", // Nombre genérico ya que no lo conocemos
      email: "pendiente@ejemplo.com", // Email genérico
      phone: "pendiente", // No tenemos el teléfono aún
      message: `Contacto iniciado vía WhatsApp para la propiedad "${propertyTitle}". Referrer: ${referrer}. User agent: ${userAgent}`,
      property_id: propertyId,
      user_id: userId,
      source: "whatsapp"
    });
    
  } catch (error) {
    console.error('Error al crear lead desde WhatsApp:', error);
  }
};
