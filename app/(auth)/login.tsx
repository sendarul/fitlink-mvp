import { supabase } from '@/lib/supabase';
import { Alert, Button, View } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';

// This is needed for the web browser redirect to work correctly on mobile
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    iosClientId: "1052100201615-pn1u3f6ls6vu9k99vvc3sliqv373s6ih.apps.googleusercontent.com",
    //androidClientId: "1052100201615-9rirbievh3hlmnohceeq3ltu3s7gs79c.apps.googleusercontent.com",
    // This line is the fix. It tells the library to use Expo's proxy
    // to handle the redirect, which is required for Expo Go.
    useProxy: true,
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
    } else if (response?.type === 'error') {
        Alert.alert('Authentication Error', response.params.error_description || 'Something went wrong');
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
