import { supabase } from './supabase';
import { queryClient } from './queryClient';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Tipo para las propiedades
type PropertyRecord = {
  id?: string;
  property_type?: string;
  [key: string]: unknown;
};

// Tipo para las imágenes de propiedades
type PropertyImageRecord = {
  property_id?: string;
  [key: string]: unknown;
};

// Tipo para los miembros del equipo
type TeamMemberRecord = {
  id?: string;
  [key: string]: unknown;
};

/**
 * Inicia las suscripciones para escuchar cambios en tiempo real
 * de las tablas relevantes de Supabase e invalidar las cachés correspondientes
 */
export const startRealtimeSubscriptions = () => {
  // Suscripción a cambios en propiedades
  supabase
    .channel('properties-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Escuchar INSERT, UPDATE y DELETE
        schema: 'public',
        table: 'properties',
      },
      (payload: RealtimePostgresChangesPayload<PropertyRecord>) => {
        console.log('Cambio detectado en propiedades:', payload);
        
        // Invalidar cachés relacionadas con propiedades
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        queryClient.invalidateQueries({ queryKey: ['featuredProperties'] });
        
        // Invalidar cachés de categorías de propiedades
        if (payload.new && 'property_type' in payload.new) {
          queryClient.invalidateQueries({ 
            queryKey: ['properties', payload.new.property_type] 
          });
        }
        
        // Si es una propiedad específica que se actualizó, invalidar su caché individual
        if (payload.new && 'id' in payload.new) {
          queryClient.invalidateQueries({ 
            queryKey: ['property', payload.new.id] 
          });
        }
      }
    )
    .subscribe();
    
  // Suscripción a cambios en el perfil de la empresa
  supabase
    .channel('company-profile-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'company_profile',
      },
      () => {
        console.log('Cambio detectado en el perfil de la empresa');
        queryClient.invalidateQueries({ queryKey: ['companyProfile'] });
      }
    )
    .subscribe();

  // Suscripción a cambios en imágenes de propiedades
  supabase
    .channel('property-images-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'property_images',
      },
      (payload: RealtimePostgresChangesPayload<PropertyImageRecord>) => {
        console.log('Cambio detectado en imágenes de propiedades:', payload);
        
        // Si la imagen está asociada a una propiedad, invalidar esa propiedad específica
        if (payload.new && 'property_id' in payload.new) {
          queryClient.invalidateQueries({ 
            queryKey: ['property', payload.new.property_id] 
          });
        }
      }
    )
    .subscribe();

  // Suscripción a cambios en miembros del equipo
  supabase
    .channel('team-members-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Escuchar INSERT, UPDATE y DELETE
        schema: 'public',
        table: 'team_members',
      },
      (payload: RealtimePostgresChangesPayload<TeamMemberRecord>) => {
        console.log('Cambio detectado en miembros del equipo:', payload);
        
        // Invalidar caché de miembros del equipo
        queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      }
    )
    .subscribe();

  // Devolver función para limpiar las suscripciones cuando sea necesario
  return () => {
    supabase.channel('properties-changes').unsubscribe();
    supabase.channel('company-profile-changes').unsubscribe();
    supabase.channel('property-images-changes').unsubscribe();
    supabase.channel('team-members-changes').unsubscribe();
  };
};
