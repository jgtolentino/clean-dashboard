/**
 * Supabase Database Types
 *
 * These types represent the database schema for the Scout Dashboard.
 * Generate fresh types using: npx supabase gen types typescript --project-id YOUR_PROJECT_ID
 *
 * @see https://supabase.com/docs/guides/api/rest/generating-types
 */

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
      // Scout Gold Transactions (flat view)
      scout_gold_transactions_flat: {
        Row: {
          transaction_id: string
          category: string | null
          brand: string | null
          brand_raw: string | null
          product: string | null
          qty: number | null
          unit: string | null
          unit_price: number | null
          total_price: number | null
          device: string | null
          store: number | null
          storename: string | null
          storelocationmaster: string | null
          storedeviceid: string | null
          storedevicename: string | null
          location: string | null
          date_ph: string | null
          time_ph: string | null
          day_of_week: string | null
          weekday_weekend: string | null
          time_of_day: string | null
          payment_method: string | null
          bought_with_other_brands: string | null
          transcript_audio: string | null
          edge_version: string | null
          sku: string | null
          ts_ph: string | null
          facialid: string | null
          gender: string | null
          emotion: string | null
          age: number | null
          agebracket: string | null
          storeid: number | null
          interactionid: string | null
          productid: string | null
          transactiondate: string | null
          deviceid: string | null
          sex: string | null
          emotionalstate: string | null
          transcriptiontext: string | null
          barangay: string | null
          size: number | null
          geolatitude: number | null
          geolongitude: number | null
          storegeometry: string | null
          managername: string | null
          managercontactinfo: string | null
          devicename: string | null
        }
        Insert: {
          transaction_id: string
          category?: string | null
          brand?: string | null
          brand_raw?: string | null
          product?: string | null
          qty?: number | null
          unit?: string | null
          unit_price?: number | null
          total_price?: number | null
          device?: string | null
          store?: number | null
          storename?: string | null
          storelocationmaster?: string | null
          storedeviceid?: string | null
          storedevicename?: string | null
          location?: string | null
          date_ph?: string | null
          time_ph?: string | null
          day_of_week?: string | null
          weekday_weekend?: string | null
          time_of_day?: string | null
          payment_method?: string | null
          bought_with_other_brands?: string | null
          transcript_audio?: string | null
          edge_version?: string | null
          sku?: string | null
          ts_ph?: string | null
          facialid?: string | null
          gender?: string | null
          emotion?: string | null
          age?: number | null
          agebracket?: string | null
          storeid?: number | null
          interactionid?: string | null
          productid?: string | null
          transactiondate?: string | null
          deviceid?: string | null
          sex?: string | null
          emotionalstate?: string | null
          transcriptiontext?: string | null
          barangay?: string | null
          size?: number | null
          geolatitude?: number | null
          geolongitude?: number | null
          storegeometry?: string | null
          managername?: string | null
          managercontactinfo?: string | null
          devicename?: string | null
        }
        Update: {
          transaction_id?: string
          category?: string | null
          brand?: string | null
          product?: string | null
          qty?: number | null
          total_price?: number | null
          [key: string]: unknown
        }
        Relationships: []
      }

      // Sales data table
      sales_data: {
        Row: {
          id: string
          date: string
          region: string
          city: string
          barangay: string
          category: string
          brand: string
          sku: string
          sales: number
          units: number
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          region: string
          city: string
          barangay: string
          category: string
          brand: string
          sku: string
          sales: number
          units: number
          price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          date?: string
          region?: string
          city?: string
          barangay?: string
          category?: string
          brand?: string
          sku?: string
          sales?: number
          units?: number
          price?: number
          updated_at?: string
        }
        Relationships: []
      }

      // Consumer data table
      consumer_data: {
        Row: {
          id: string
          age_group: string
          gender: string
          income_level: string
          region: string
          purchase_frequency: number
          average_basket_size: number
          preferred_categories: string[]
          created_at: string
        }
        Insert: {
          id?: string
          age_group: string
          gender: string
          income_level: string
          region: string
          purchase_frequency: number
          average_basket_size: number
          preferred_categories: string[]
          created_at?: string
        }
        Update: {
          age_group?: string
          gender?: string
          income_level?: string
          region?: string
          purchase_frequency?: number
          average_basket_size?: number
          preferred_categories?: string[]
        }
        Relationships: []
      }

      // User profiles table
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'executive' | 'regional_manager' | 'analyst' | 'store_owner'
          department: string | null
          region: string | null
          store_id: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'executive' | 'regional_manager' | 'analyst' | 'store_owner'
          department?: string | null
          region?: string | null
          store_id?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          role?: 'executive' | 'regional_manager' | 'analyst' | 'store_owner'
          department?: string | null
          region?: string | null
          store_id?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }

      // Stores table
      stores: {
        Row: {
          id: string
          name: string
          location: string
          region: string
          city: string
          barangay: string | null
          latitude: number | null
          longitude: number | null
          manager_name: string | null
          manager_contact: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          region: string
          city: string
          barangay?: string | null
          latitude?: number | null
          longitude?: number | null
          manager_name?: string | null
          manager_contact?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          location?: string
          region?: string
          city?: string
          barangay?: string | null
          latitude?: number | null
          longitude?: number | null
          manager_name?: string | null
          manager_contact?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }

    Views: {
      // Add any database views here
    }

    Functions: {
      // Execute raw SQL (for AI assistant)
      execute_sql: {
        Args: { query: string }
        Returns: Json
      }
    }

    Enums: {
      user_role: 'executive' | 'regional_manager' | 'analyst' | 'store_owner'
    }

    CompositeTypes: {
      // Add any composite types here
    }
  }
}

// Convenience type exports
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Specific table types
export type Transaction = Tables<'scout_gold_transactions_flat'>
export type SalesData = Tables<'sales_data'>
export type ConsumerData = Tables<'consumer_data'>
export type Profile = Tables<'profiles'>
export type Store = Tables<'stores'>

// User role type
export type UserRole = Database['public']['Enums']['user_role']
