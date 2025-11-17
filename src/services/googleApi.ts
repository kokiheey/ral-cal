import {
  GoogleSignin
} from '@react-native-google-signin/google-signin';

import { EventType } from '../types/event';

const createEvent = async (calendarId: string, event: EventType) => {
  const { accessToken } = await GoogleSignin.getTokens();

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    }
  );

  if (!res.ok) throw new Error('calendar insert failed');
  return await res.json();
};

const getCalendarColors = async () => {
  const { accessToken } = await GoogleSignin.getTokens();

  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/colors',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!res.ok) throw new Error('color fetch failed');
  const data = await res.json();
  return data.event;
};


export { createEvent, getCalendarColors };

