import AuthProvider, { useAuth } from '@/providers/AuthProvider';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

// This component handles all the routing logic based on auth state
const InitialLayout = () => {
  const { session, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Wait until the session and profile are finished loading
    if (loading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session) {
      // If the user is not signed in, redirect to the login page.
      // No need to check if they are already in the auth group, replace will handle it.
      router.replace('/(auth)/login');
    } else if (!profile && !inOnboarding) {
      // If the user is signed in but has no profile, and they are NOT on the onboarding screen,
      // redirect them to onboarding.
      router.replace('/onboarding');
    } else if (session && profile) {
      // If the user is signed in and has a profile, send them to the main app.
      // This will also handle the case where a logged-in user tries to access login/onboarding.
      router.replace('/(tabs)/');
    }
  }, [session, profile, loading, segments]);

  // Show a loading spinner while we determine where to send the user
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Render the currently active screen
  return <Slot />;
};

// This is the root layout component for the entire app
export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}
