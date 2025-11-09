import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
const GOOGLE_CLIENT_ID = '185106367353-ad0blf89be9979l4uech1ia91eja4fgt.apps.googleusercontent.com' // web client ID
const SCOPES = ['https://www.googleapis.com/auth/calendar'];


export type CalendarEvent = {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  location?: string;
  attendees?: { email: string }[];
};

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export class GoogleCalendarService {
  private accessToken: string | null = null;
  private calendarId = 'primary';

  async signIn() {
    const redirectUri = Platform.select({
        web: window.location.origin,        // for web
        default: AuthSession.makeRedirectUri(), // for Android/iOS
    });
    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['https://www.googleapis.com/auth/calendar'],
      redirectUri,
    });

    // Prepare request
    await request.makeAuthUrlAsync(discovery); // optional, internal

    // Launch the OAuth flow
    const result = await request.promptAsync(discovery);

    if (result.type !== 'success' || !result.params.access_token) {
      throw new Error('Google login failed');
    }

    this.accessToken = result.params.access_token;
    return this.accessToken;
  }

  async createEvent(event: CalendarEvent) {
    if (!this.accessToken) throw new Error('Not signed in');

    const url = `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error('Failed to create event: ' + text);
    }
    console.log('Token:', response.json); // shows whether logged in


    return response.json();
  }
}
