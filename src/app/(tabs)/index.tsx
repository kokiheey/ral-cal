import StopWatch from '@/src/components/StopWatch';
import { loadEventTypes } from '@/src/services/storage';
import { EventType } from '@/src/types/event';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useRouter } from 'expo-router';
import { cssInterop } from 'nativewind';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, ScrollView as RNScrollView, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from "react-native-safe-area-context";
import uuid from 'react-native-uuid';
export const ScrollView = cssInterop(RNScrollView, {
    contentContainerStyle: true,
});

function ListElement({id, name}: {id:string, name:string}) {
    return(
        <TouchableOpacity className="w-full bg-accent h-10">
          <Text className="text-bold">{name}</Text>
        </TouchableOpacity>
    )
}

async function createDummyCalendarEvent() {
  const { accessToken } = await GoogleSignin.getTokens();

  const eventBody = {
    summary: "Test Event",
    description: "Dummy event created for API testing",
    start: {
      dateTime: new Date().toISOString(),
      timeZone: "UTC",
    },
    end: {
      dateTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      timeZone: "UTC",
    },
  };

  await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventBody),
  });
}


GoogleSignin.configure({
  webClientId: '185106367353-ad0blf89be9979l4uech1ia91eja4fgt.apps.googleusercontent.com', // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
  scopes: [
    'https://www.googleapis.com/auth/calendar'
  ],
  offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  hostedDomain: '', // specifies a hosted domain restriction
  forceCodeForRefreshToken: false, // [Android] related to `serverAuthCode`, read the docs link below *.
  accountName: '', // [Android] specifies an account name on the device that should be used
  googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. "GoogleService-Info-Staging"
  openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
  profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
});

export default function Index() {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["5%", "25%"], []);
  const router = useRouter();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [accessToken, setAccessToken] = useState();
  useEffect(() => {
  const boot = async () => {
    try {
      //const user = await GoogleSignin.signInSilently();
      const user = await GoogleSignin.signIn();
      console.log("success");
      console.log(user.data?.user.email);
      //setAccessToken(user.data?.)
    } catch (e) {
      //await signInGoogle();
      console.log("error: ", e);
    }
    const tempTypes = await loadEventTypes();
    setEventTypes(tempTypes);
  };
  boot();
}, []);


  function handleNewEvent(){
    const id = uuid.v4();
    const placeholder = {id, name:'', description:'', quota:0};
    router.push(`./event/${id}`);
  }



  return (
        <SafeAreaView className="flex-1 bg-dark-200">
         <GestureHandlerRootView >
          <ScrollView className="flex-1" contentContainerStyle="flex items-center flex-grow">
            <View className="flex items-center flex-grow">
               <TouchableOpacity
                className="w-full bg-light-100 items-center mt-4"
                onPress={createDummyCalendarEvent}
               >
                <Text className="text-dark-100 font-bold">Test Google Calendar API</Text>
            </TouchableOpacity>
              <Text className="text-5xl text-light-200 font-bold mt-12 mb-12 select-none" selectable={false}>RalCal</Text>
              <StopWatch />
           
            </View>

          </ScrollView>
            <BottomSheet
              ref={sheetRef}
              snapPoints={snapPoints}
              backgroundStyle={{ backgroundColor: '#1d0f4e'}}
              >
                {/* MORA PLATFORM SPECIFIC*/}
                <BottomSheetScrollView className="w-full" contentContainerStyle={
                    Platform.OS === "web"
                      ? { alignItems: "center" }
                      : "items-center"
                  }>
                  <View>
                    <TouchableOpacity className="w-full bg-light-100 items-center mt-4"
                    onPress={handleNewEvent}
                    >
                      <Text className="text-dark-100 font-bold">+ Event</Text>
                    </TouchableOpacity>
                  </View>
                  {eventTypes.map(event => (
                    <ListElement key={event.id} id={event.id} name={event.name} />
                  ))}

                </BottomSheetScrollView>
            </BottomSheet>
          </GestureHandlerRootView>
         </SafeAreaView>
  );
}
