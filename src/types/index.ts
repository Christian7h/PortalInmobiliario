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
  updated_at: string;
}