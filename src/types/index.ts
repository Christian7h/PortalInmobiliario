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

export type EnergyRating = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export type ConstructionStatus = 'terminado' | 'en_construccion' | 'en_plano' | 'por_renovar';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';

export type LeadSource = 'website' | 'whatsapp' | 'email';

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  property_id: string | null;
  status: LeadStatus;
  notes: string | null;
  user_id: string;
  source: LeadSource;
  last_contact: string;
  property?: Property;
}

export interface ServicesNearby {
  count: number;
  distance: number;
}

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
  // Nuevos campos de análisis
  virtual_tour_url?: string;
  year_built?: number;
  parking_spaces?: number;
  total_floors?: number;
  floor_number?: number;
  maintenance_fee?: number;
  energy_rating?: EnergyRating;
  construction_status?: ConstructionStatus;
  // Campos de análisis del vecindario
  schools_nearby?: ServicesNearby;
  shops_nearby?: ServicesNearby;
  transport_nearby?: ServicesNearby;
  green_areas_nearby?: ServicesNearby;
  services_nearby?: ServicesNearby;
  avg_square_meter_price?: number;
  annual_value_increase?: number;
  security_index?: number;
  life_quality_index?: number;
  // Demografía del vecindario
  demographics?: {
    families?: number;
    young_professionals?: number;
    retired?: number;
    students?: number;
  };
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