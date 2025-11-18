import {
  GoogleSignin
} from '@react-native-google-signin/google-signin';

import { EventType } from '../types/event';

const createEvent = async (calendarId: string, event: EventType, startTime: number, endTime: number) => {
  const { accessToken } = await GoogleSignin.getTokens();

  // Build description with quota info
  let description = event.description || '';
  const googleEvent = {
    summary: event.name,
    description: description.trim(),
    colorId: event.colorId, // Use the colorId from your EventType
    start: {
      dateTime: new Date(startTime).toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    end: {
      dateTime: new Date(endTime).toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    },
    extendedProperties: {
      private: {
        eventId: event.id,
        quota: event.quota.toString()
      }
    }
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(googleEvent)
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Calendar insert failed: ${res.status} - ${errorText}`);
  }
  return await res.json();
};

interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  timeZone?: string;
  colorId?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  selected?: boolean;
  accessRole: 'owner' | 'reader' | 'writer' | 'freeBusyReader';
}

interface CalendarListResponse {
  items: GoogleCalendar[];
}

const getAvailableCalendars = async (): Promise<GoogleCalendar[]> => {
  const { accessToken } = await GoogleSignin.getTokens();

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/users/me/calendarList',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!res.ok) throw new Error('Failed to fetch calendars');
  const data: CalendarListResponse = await res.json();
  return data.items;
};


export { createEvent, getAvailableCalendars, getCalendarColors, GoogleCalendar };

