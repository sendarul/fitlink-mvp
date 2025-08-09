import { supabase } from '@/lib/supabase';
import { Alert, Button, View } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';

// This is needed for the web browser redirect to work correctly on mobile
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "711718468265-1biq9ps8c1jn1hfrtb5msdr0r9mn5kkv.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      
      supabase.auth.signInWithIdToken({
        provider: 'google',
        token: id_token,
      }).then(({ error }) => {
        if (error) Alert.alert('Sign In Error', error.message);
      });
    }
  }, [response]);

  const handleGoogleSignIn = async () => {
    if (request) {
      await promptAsync();
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Sign in with Google" onPress={handleGoogleSignIn} disabled={!request} />
    </View>
  );
}