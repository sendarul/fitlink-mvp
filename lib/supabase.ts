import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Retrieve Supabase URL and Key from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Check if the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or Anon Key is missing. Make sure to set up your .env file.");
}

// Create and export the Supabase client
// We pass the Database generic to get full TypeScript support
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // It's recommended to use a secure storage option like expo-secure-store
    // For simplicity in this MVP, we'll use the default which is AsyncStorage
    storage: undefined, 
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
