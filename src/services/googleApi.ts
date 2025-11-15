import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes
} from '@react-native-google-signin/google-signin';


const signInGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
  } catch (error) {
    if (isErrorWithCode(error)) { 
      switch (error.code) {
        case statusCodes.IN_PROGRESS:
          // operation (eg. sign in) already in progress
          break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          // Android only, play services not available or outdated
          break;
        default:
        // some other error happened
      }
    } else {
      // an error that's not related to google sign in occurred
    }
  }
};

const createEvent = async (calendarId: string, event: any) => {
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


export { createEvent, getCalendarColors, signInGoogle };

