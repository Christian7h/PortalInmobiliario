// emailService.ts - Servicio para manejo de notificaciones por correo electrónico
import { supabase } from './supabase';
import { Lead } from '../types';

/**
 * Función para enviar notificación por correo cuando se crea un nuevo lead
 * Utiliza la funcionalidad de Edge Functions de Supabase para enviar emails
 */
export const sendNewLeadNotification = async (lead: Lead, agentEmail?: string) => {
  try {
    // Si no hay un email de agente específico, buscamos el email del propietario de la propiedad
    if (!agentEmail && lead.property_id) {
      // Primero obtenemos la propiedad para conseguir el user_id
      const { data: propertyData } = await supabase
        .from('properties')
        .select('user_id')
        .eq('id', lead.property_id)
        .single();

      if (propertyData) {
        // Luego buscamos el perfil de la empresa asociado a ese user_id
        const { data: profileData } = await supabase
          .from('company_profile')
          .select('contact_email')
          .eq('user_id', propertyData.user_id)
          .single();

        if (profileData) {
          agentEmail = profileData.contact_email;
        }
      }
    }

    // Si aún no tenemos un email, usamos el email del admin por defecto
    if (!agentEmail) {
      // Obtenemos el email del usuario administrador
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('id', lead.user_id)
        .single();
      
      if (userData) {
        agentEmail = userData.email;
      }
    }

    // Si seguimos sin email, no podemos enviar la notificación
    if (!agentEmail) {
      console.warn('No se encontró un email de destino para la notificación');
      return null;
    }

    // Usamos un enfoque con timeout simple para evitar bloqueos
    let timeoutOccurred = false;
    const timeoutId = setTimeout(() => {
      timeoutOccurred = true;
      console.warn('Timeout al invocar la Edge Function de notificación');
    }, 5000);
    
    try {
      // Intentamos llamar a nuestra Edge Function para enviar el email
      const { data, error } = await supabase.functions.invoke('send-lead-notification', {
        body: {
          leadId: lead.id,
          to: agentEmail,
          leadName: lead.name,
          leadEmail: lead.email,
          leadPhone: lead.phone,
          leadMessage: lead.message,
          propertyTitle: lead.property?.title || 'N/A',
          source: lead.source
        }
      });

      // Limpiamos el timeout ya que la función respondió
      clearTimeout(timeoutId);
        
      // Si ocurrió un timeout mientras esperábamos, ignoramos el resultado
      if (timeoutOccurred) {
        return null;
      }

      if (error) {
        console.warn('No se pudo enviar la notificación por email:', error);
        // Registramos el error en la base de datos para referencia futura
        try {
          await supabase.from('lead_activities').insert({
            lead_id: lead.id,
            activity_type: 'email_notification_failed',
            description: `Error al enviar notificación: ${error.message || 'Error desconocido'}`,
          });
        } catch (dbErr) {
          console.warn('No se pudo registrar el error en la base de datos:', dbErr);
        }
        return null;
      }

      return data;
    } catch (functionError) {
      // Limpiamos el timeout si hay un error
      clearTimeout(timeoutId);
      console.warn('Error en Edge Function de notificación:', functionError);
      // No bloqueamos el flujo por errores de email
      return null;
    }
  } catch (error) {
    console.error('Error al preparar la notificación de nuevo lead:', error);
    // No bloqueamos el flujo principal por errores de email
    return null;
  }
};

/**
 * Función para enviar una respuesta automática al lead
 */
export const sendLeadAutoResponse = async (lead: Lead) => {
  try {
    // Verificamos que el lead tenga un email
    if (!lead.email) {
      console.warn('El lead no tiene dirección de correo, no se puede enviar respuesta automática');
      return null;
    }

    // Usamos un enfoque con timeout simple para evitar bloqueos
    let timeoutOccurred = false;
    const timeoutId = setTimeout(() => {
      timeoutOccurred = true;
      console.warn('Timeout al invocar la Edge Function de respuesta automática');
    }, 5000);
    
    try {
      // Intentamos llamar a la Edge Function
      const { data, error } = await supabase.functions.invoke('send-lead-auto-response', {
        body: {
          to: lead.email,
          name: lead.name,
          propertyTitle: lead.property?.title || 'N/A',
          propertyId: lead.property_id || 'N/A'
        }
      });
      
      // Limpiamos el timeout ya que la función respondió
      clearTimeout(timeoutId);
      
      // Si ocurrió un timeout mientras esperábamos, ignoramos el resultado
      if (timeoutOccurred) {
        return null;
      }

      if (error) {
        console.warn('No se pudo enviar la respuesta automática al lead:', error);
        // Registramos el error pero no bloqueamos el flujo
        try {
          await supabase.from('lead_activities').insert({
            lead_id: lead.id,
            activity_type: 'auto_response_email_failed',
            description: `Error al enviar respuesta automática: ${error.message || 'Error desconocido'}`,
          });
        } catch (dbErr) {
          console.warn('No se pudo registrar el error en la base de datos:', dbErr);
        }
        return null;
      }
      
      return data;
    } catch (functionError) {
      // Limpiamos el timeout si hay un error
      clearTimeout(timeoutId);
      console.warn('Error en Edge Function de respuesta automática:', functionError);
      // No bloqueamos el flujo por errores de email
      return null;
    }
  } catch (error) {
    console.error('Error al enviar respuesta automática al lead:', error);
    // No bloqueamos el flujo principal por errores de email
    return null;
  }
};
