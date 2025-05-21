// filepath: src/lib/api.ts
import { supabase } from './supabase';
import { CompanyProfile, Property, TeamMember } from '../types';

/**
 * Servicio para obtener el perfil de la empresa
 * Esta función puede ser reutilizada en diferentes componentes
 */
export const fetchCompanyProfile = async (): Promise<CompanyProfile> => {
  const { data, error } = await supabase
    .from('company_profile')
    .select('*')
    .single();
  
  if (error) {
    throw new Error('Error al cargar el perfil de la empresa');
  }
  
  return data as CompanyProfile;
};

/**
 * Servicio para obtener una propiedad específica por su ID
 */
export const fetchPropertyById = async (id: string): Promise<Property> => {
  // Obtener la propiedad
  const { data: propertyData, error: propertyError } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();
    
  if (propertyError) throw propertyError;
  if (!propertyData) throw new Error('Propiedad no encontrada');
  
  // Obtener imágenes
  const { data: imageData } = await supabase
    .from('property_images')
    .select('*')
    .eq('property_id', id);
  
  // Obtener perfil de la empresa
  const { data: companyProfileData } = await supabase
    .from('company_profile')
    .select('id, company_name, contact_email, contact_phone, logo_url, description, whatsapp_number')
    .eq('user_id', propertyData.user_id)
    .single();
  
  return {
    ...propertyData,
    images: imageData || [],
    profile: companyProfileData || null,
  } as Property;
};

/**
 * Servicio para obtener las propiedades destacadas
 */
export const fetchFeaturedProperties = async (): Promise<Property[]> => {
  // Obtener propiedades destacadas
  const { data: propertiesData, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (propertiesError) throw propertiesError;

  // Obtener imágenes para cada propiedad
  const propertiesWithImages = await Promise.all(
    propertiesData.map(async (property) => {
      const { data: imageData } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', property.id);
      
      return {
        ...property,
        images: imageData || []
      };
    })
  );
  
  return propertiesWithImages;
};

/**
 * Servicio para obtener propiedades por categoría
 */
export const fetchPropertiesByCategory = async (category: string): Promise<Property[]> => {
  // Obtener propiedades de la categoría
  const { data: propertiesData, error: propertiesError } = await supabase
    .from('properties')
    .select('*')
    .eq('property_type', category)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (propertiesError) throw propertiesError;

  // Obtener imágenes para cada propiedad
  const propertiesWithImages = await Promise.all(
    propertiesData.map(async (property) => {
      const { data: imageData } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', property.id);
      
      return {
        ...property,
        images: imageData || []
      };
    })
  );
  
  return propertiesWithImages;
};

/**
 * Servicio para buscar propiedades con filtros
 */
export const searchFilteredProperties = async (
  type: string,
  filters: {
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    currency?: string;
    minBedrooms?: string;
    minBathrooms?: string;
    sortBy?: string;
    operationType?: string;
    publicationStatus?: string;
  }
): Promise<Property[]> => {
  try {
    // Iniciar la consulta
    let query = supabase
      .from('properties')
      .select('*, property_images(*)')
      .eq('property_type', type);
    
    // Aplicar filtros adicionales si existen
    if (filters.location) {
      query = query.or(`city.ilike.%${filters.location}%,address.ilike.%${filters.location}%`);
    }
    
    if (filters.currency && filters.minPrice) {
      query = query.eq('currency', filters.currency).gte('price', filters.minPrice);
    }
    
    if (filters.currency && filters.maxPrice) {
      query = query.eq('currency', filters.currency).lte('price', filters.maxPrice);
    }
    
    if (filters.minBedrooms) {
      query = query.gte('bedrooms', filters.minBedrooms);
    }
      if (filters.minBathrooms) {
      query = query.gte('bathrooms', filters.minBathrooms);
    }
    
    // Filtrar por tipo de operación
    if (filters.operationType) {
      query = query.eq('operation_type', filters.operationType);
    }
    
    // Filtrar por estado de publicación
    if (filters.publicationStatus === 'disponible') {
      query = query.eq('publication_status', 'disponible');
    }
    
    // Aplicar ordenamiento
    switch(filters.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }
    
    const { data, error } = await query;

    if (error) throw error;
    
    // Asegurarse de que cada propiedad tenga un array de imágenes
    const propertiesWithImages = data?.map(property => {
      return {
        ...property,
        images: property.property_images || []
      };
    }) || [];
    
    return propertiesWithImages;
  } catch (error) {
    console.error("Error en searchFilteredProperties:", error);
    throw error;
  }
};

/**
 * Servicio para obtener los miembros activos del equipo
 */
export const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_active', true)
    .order('order_number', { ascending: true });
  
  if (error) {
    throw new Error('Error al cargar los miembros del equipo');
  }
  
  return data as TeamMember[];
};

/**
 * Servicio para obtener un miembro del equipo por ID
 */
export const fetchTeamMemberById = async (id: string): Promise<TeamMember> => {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw new Error('Error al cargar el miembro del equipo');
  }
  
  return data as TeamMember;
};

/**
 * Servicio para obtener leads
 */
export const fetchLeads = async (filters?: {
  status?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
}) => {
  let query = supabase
    .from('leads')
    .select(`
      *,
      property:properties (
        id,
        title,
        address,
        city,
        price,
        currency
      )
    `)
    .order('created_at', { ascending: false });

  // Aplicar filtros si existen
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.source) {
    query = query.eq('source', filters.source);
  }
  
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate);
  }

  const { data, error } = await query;
  
  if (error) {
    throw new Error('Error al cargar los leads');
  }
  
  return data;
};

/**
 * Servicio para crear un nuevo lead
 */
export const createLead = async (leadData: {
  name: string;
  email: string;
  phone: string;
  message: string;
  property_id?: string | null;
  user_id: string;
  source: 'website' | 'whatsapp' | 'email';
}) => {
  try {
    // Insertamos el lead en la base de datos
    const { data, error } = await supabase
      .from('leads')
      .insert([{
        ...leadData,
        status: 'new',
        last_contact: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      throw new Error('Error al crear el lead');
    }
    
    // Si hay un property_id, obtenemos los datos completos de la propiedad
    let leadWithProperty = data;
    if (data.property_id) {
      const { data: propertyData } = await supabase
        .from('properties')
        .select('*')
        .eq('id', data.property_id)
        .single();
      
      leadWithProperty = {
        ...data,
        property: propertyData || null
      };
    }

    // Intentamos enviar la notificación por correo (importamos dinámicamente para evitar errores cíclicos)
    // Los métodos ya están modificados para manejar errores internamente sin interrumpir el flujo
    import('./emailService').then(emailService => {
      try {
        // Enviar notificación al agente/admin (con manejo silencioso de errores)
        emailService.sendNewLeadNotification(leadWithProperty);
        
        // Enviar respuesta automática al lead (con manejo silencioso de errores)
        emailService.sendLeadAutoResponse(leadWithProperty);
        
        console.log('Notificaciones enviadas correctamente');
      } catch (emailErr) {
        // Este bloque no debería ejecutarse debido al manejo silencioso de errores
        console.warn('Error general en servicios de email:', emailErr);
      }
    }).catch(importErr => {
      console.warn('Error al importar servicios de email:', importErr);
    });
    
    return data;
  } catch (error) {
    console.error('Error en createLead:', error);
    throw error;
  }
};

/**
 * Servicio para actualizar el estado de un lead
 */
export const updateLeadStatus = async (
  leadId: string,
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted'
) => {
  const { data, error } = await supabase
    .from('leads')
    .update({ 
      status, 
      last_contact: new Date().toISOString() 
    })
    .eq('id', leadId)
    .select()
    .single();
  
  if (error) {
    throw new Error('Error al actualizar el estado del lead');
  }
  
  return data;
};

/**
 * Servicio para actualizar las notas de un lead
 */
export const updateLeadNotes = async (leadId: string, notes: string) => {
  const { data, error } = await supabase
    .from('leads')
    .update({ notes })
    .eq('id', leadId)
    .select()
    .single();
  
  if (error) {
    throw new Error('Error al actualizar las notas del lead');
  }
  
  return data;
};
