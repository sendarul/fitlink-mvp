import { supabase } from '@/lib/supabase';
import { View, Text, Button, Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';

// This is needed for the web browser redirect to work correctly
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    // You need to create these IDs in your Google Cloud Console
    // For now, we'll use the Expo Go Client ID for development
    expoClientId: "711718468265-1biq9ps8c1jn1hfrtb5msdr0r9mn5kkv.apps.googleusercontent.com", // We'll get this in a sec
    iosClientId: '711718468265-56s3cv3u27kq2rnpggc7fa3io4ip9fn3.apps.googleusercontent.com',
    //androidClientId: 'GOOGLE_GUID.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      supabase.auth.signInWithIdToken({
        provider: 'google',
        token: id_token,
      }).then(({ error }) => {
        if (error) Alert.alert('Error', error.message);
      });
    }
  }, [response]);

  const handleGoogleSignIn = async () => {
    await promptAsync();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Sign in with Google" onPress={handleGoogleSignIn} disabled={!request} />
    </View>
  );
}