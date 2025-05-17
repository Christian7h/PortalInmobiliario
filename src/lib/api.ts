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
