import AuthProvider, { useAuth } from '@/providers/AuthProvider';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

const InitialLayout = () => {
  const { session, profile, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session) {
      // User is not signed in, redirect to the login page.
      router.replace('/(auth)/login');
    } else if (!profile && !inAuthGroup) {
      // User is signed in but has no profile, redirect to onboarding.
      router.replace('/onboarding');
    } else if (session && profile && segments[0] !== '(tabs)') {
      // User is signed in and has a profile, redirect to the main app.
      router.replace('/(tabs)/');
    }
  }, [session, profile, loading]);

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <InitialLayout />
    </AuthProvider>
  );
}