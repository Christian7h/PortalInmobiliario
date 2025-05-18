export type PropertyType = 
  | 'casa' 
  | 'departamento' 
  | 'oficina' 
  | 'local' 
  | 'bodega' 
  | 'industrial' 
  | 'terreno' 
  | 'parcela' 
  | 'sitio' 
  | 'loteo' 
  | 'agricola';

export type Currency = 'CLP' | 'UF';

export type PublicationStatus = 'disponible' | 'reservado' | 'arrendado' | 'vendido';

export type OperationType = 'venta' | 'arriendo';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: Currency;
  address: string;
  city: string;
  longitude?: number;
  latitude?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  area_unit: string;
  property_type: PropertyType;
  is_featured: boolean;
  publication_status: PublicationStatus;
  operation_type: OperationType;
  user_id: string;
  created_at: string;
  updated_at: string;
  images: PropertyImage[];
  profile?: CompanyProfile;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  is_primary: boolean;
  user_id: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio?: string;
  photo_url?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  order_number: number;
  is_active: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfile {
  id: string;
  company_name: string;
  contact_email: string;
  contact_phone: string;
  logo_url?: string;
  description?: string;
  address?: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  whatsapp_number?: string;
  user_id: string;
  mission?: string;
  vision?: string;
  values?: string;
  history?: string;
  years_experience?: number;
  updated_at: string;
}