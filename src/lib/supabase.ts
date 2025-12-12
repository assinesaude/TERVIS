import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type User = Database['public']['Tables']['users']['Row']
export type Professional = Database['public']['Tables']['professionals']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          user_type: 'patient' | 'professional'
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          user_type: 'patient' | 'professional'
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          user_type?: 'patient' | 'professional'
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      professionals: {
        Row: {
          id: string
          user_id: string
          profession: string
          specialty: string | null
          registration_number: string | null
          city: string
          state: string
          bio: string | null
          verification_status: 'pending' | 'verified' | 'rejected'
          plan_type: 'none' | 'essential' | 'professional' | 'premium'
          accepts_online: boolean
          accepts_in_person: boolean
          custom_url: string | null
          rating: number
          total_reviews: number
          priority_level: number
          is_exclusive: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profession: string
          specialty?: string | null
          registration_number?: string | null
          city: string
          state: string
          bio?: string | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          plan_type?: 'none' | 'essential' | 'professional' | 'premium'
          accepts_online?: boolean
          accepts_in_person?: boolean
          custom_url?: string | null
          rating?: number
          total_reviews?: number
          priority_level?: number
          is_exclusive?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profession?: string
          specialty?: string | null
          registration_number?: string | null
          city?: string
          state?: string
          bio?: string | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          plan_type?: 'none' | 'essential' | 'professional' | 'premium'
          accepts_online?: boolean
          accepts_in_person?: boolean
          custom_url?: string | null
          rating?: number
          total_reviews?: number
          priority_level?: number
          is_exclusive?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      stripe_user_subscriptions: {
        Row: {
          customer_id: string
          subscription_id: string | null
          subscription_status: string
          price_id: string | null
          current_period_start: number | null
          current_period_end: number | null
          cancel_at_period_end: boolean
          payment_method_brand: string | null
          payment_method_last4: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          professional_id: string
          patient_id: string
          service_id: string | null
          appointment_date: string
          duration_minutes: number
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'refunded'
          payment_intent_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          patient_id: string
          service_id?: string | null
          appointment_date: string
          duration_minutes: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_intent_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          patient_id?: string
          service_id?: string | null
          appointment_date?: string
          duration_minutes?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'refunded'
          payment_intent_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      stripe_user_subscriptions: {
        Row: {
          customer_id: string
          subscription_id: string | null
          subscription_status: string
          price_id: string | null
          current_period_start: number | null
          current_period_end: number | null
          cancel_at_period_end: boolean
          payment_method_brand: string | null
          payment_method_last4: string | null
        }
      }
    }
  }
}