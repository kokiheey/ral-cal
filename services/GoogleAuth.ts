import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';

let accessToken: string | null = null;

export const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: 'YOUR_CLIENT_ID',
  scopes: ['https://www.googleapis.com/auth/calendar'],
});


export const handleAuthResponse = async () => {
  if (response?.type === 'success') {
    accessToken = response.authentication?.accessToken ?? null;
    if (accessToken) {
      await SecureStore.setItemAsync('googleAccessToken', accessToken);
    }
  }
};


export const getAccessToken = async (): Promise<string | null> => {
  if (accessToken) return accessToken;
  const stored = await SecureStore.getItemAsync('googleAccessToken');
  accessToken = stored;
  return accessToken;
};
