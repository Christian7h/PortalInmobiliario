export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          price: number
          currency: string
          address: string
          city: string
          longitude: number | null
          latitude: number | null
          bedrooms: number | null
          bathrooms: number | null
          area: number | null
          area_unit: string
          property_type: string
          is_featured: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          price: number
          currency: string
          address: string
          city: string
          longitude?: number | null
          latitude?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          area?: number | null
          area_unit?: string
          property_type: string
          is_featured?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          price?: number
          currency?: string
          address?: string
          city?: string
          longitude?: number | null
          latitude?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          area?: number | null
          area_unit?: string
          property_type?: string
          is_featured?: boolean
        }
      }
      property_images: {
        Row: {
          id: string
          created_at: string
          property_id: string
          image_url: string
          is_primary: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          property_id: string
          image_url: string
          is_primary?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          property_id?: string
          image_url?: string
          is_primary?: boolean
        }
      }
      company_profile: {
        Row: {
          id: string
          updated_at: string
          company_name: string
          description: string | null
          contact_email: string
          contact_phone: string
          address: string
          city: string
          logo_url: string | null
          social_facebook: string | null
          social_instagram: string | null
          social_twitter: string | null
          whatsapp: string | null
          created_by: string
        }
        Insert: {
          id?: string
          updated_at?: string
          company_name: string
          description?: string | null
          contact_email: string
          contact_phone: string
          address: string
          city: string
          logo_url?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          whatsapp?: string | null
          created_by: string
        }
        Update: {
          id?: string
          updated_at?: string
          company_name?: string
          description?: string | null
          contact_email?: string
          contact_phone?: string
          address?: string
          city?: string
          logo_url?: string | null
          social_facebook?: string | null
          social_instagram?: string | null
          social_twitter?: string | null
          whatsapp?: string | null
          created_by?: string
        }
      }
    }
  }
}