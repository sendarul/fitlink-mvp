import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { PropsWithChildren, createContext, useContext, useEffect, useState } from 'react';
import { Database } from '@/lib/database.types';

// Define the type for a user profile based on your database schema
type Profile = Database['public']['Tables']['profiles']['Row'];

// Define the shape of the data that the context will provide
type AuthData = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
};

// Create the authentication context with default values
const AuthContext = createContext<AuthData>({
  session: null,
  profile: null,
  loading: true,
});

// Create the provider component that will wrap the application
export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This function fetches the initial session and profile data
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      // If a session exists, fetch the corresponding profile
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        // If a profile is found, update the state
        setProfile(data || null);
      }
      setLoading(false);
    };

    fetchSession();

    // Set up a listener for authentication state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
       // Also re-fetch the profile when the auth state changes
       if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(data || null);
      }
    });

    // Clean up the subscription when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  // Provide the session, profile, and loading state to the rest of the app
  return (
    <AuthContext.Provider value={{ session, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Create a custom hook to easily access the auth context in other components
export const useAuth = () => useContext(AuthContext);
