  import StopWatch from '@/src/components/StopWatch';
import { loadEventTypes, removeEventType } from '@/src/services/storage';
import { EventType } from '@/src/types/event';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useFocusEffect, useRouter } from 'expo-router';
import { cssInterop } from 'nativewind';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView as RNScrollView, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SafeAreaView } from "react-native-safe-area-context";
import uuid from 'react-native-uuid';
  export const ScrollView = cssInterop(RNScrollView, {
      contentContainerStyle: true,
  });




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
    const swipeableRefs = useRef<{ [key: string]: typeof Swipeable | null }>({});
    const snapPoints = useMemo(() => ["5%", "25%"], []);
    const router = useRouter();
    const [eventTypes, setEventTypes] = useState<EventType[]>([]);
    const [accessToken, setAccessToken] = useState();
    const [currentEvent, setCurrentEvent] = useState<string>();
    useEffect(() => {
      const boot = async () => {
        try {
          const current = await GoogleSignin.getCurrentUser();
          let user;


          if (current) {
            user = current.user;
          } else {
            const resp = await GoogleSignin.signInSilently();

            user = resp.data?.user;
          }
          if(!user) throw new Error("No user??");
          console.log("success");
          console.log(user?.email);
        } catch (e) {
          await GoogleSignin.signIn();
          console.log("error: ", e);
        }
        const tempTypes = await loadEventTypes();
        setEventTypes(tempTypes);
      };
      boot();
    }, []);

    useFocusEffect(() => {
      let active = true;
      const load = async () => {
        const types = await loadEventTypes();
        if (active) setEventTypes(types);
      };
      load();
      return () => { active = false };
    });


    function handleNewEvent(){
      const id = uuid.v4();
      const placeholder = {id, name:'', description:'', quota:0};
      router.push(`./event/${id}`);
    }

    function handleEventChange(eventId:string){
        setCurrentEvent(eventId);
    }

    function ListElement({ id, name } : {id:string, name:string }) {
      const renderRight = () => (
          <Pressable
            className="bg-red-600 w-20 h-12 items-center justify-center"
            onPress={() => removeEventType(id)}
          >
            <Text className="text-white">Del</Text>
          </Pressable>
        );

        return (
          <Swipeable
           friction={2} 
          renderRightActions={renderRight} containerStyle={{ width: '100%' }}
          simultaneousHandlers={sheetRef.current?.} >
            <Pressable
              className="bg-accent w-full mt-4 h-12 items-center justify-center"
              onPress={() => handleEventChange(id)}
            >
              <Text className="text-bold">{name}</Text>
            </Pressable>
          </Swipeable>
        );
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
                <Text className="text-5xl text-light-200 font-bold mt-12 mb-6 select-none" selectable={false}>RalCal</Text>
                <StopWatch />
            
              </View>

            </ScrollView>
              <BottomSheet
                ref={sheetRef}
                snapPoints={snapPoints}
                backgroundStyle={{ backgroundColor: '#1d0f4e'}}
                //enableContentPanningGesture={false}
                >
                  {/* MORA PLATFORM SPECIFIC*/}
                  <BottomSheetScrollView className="w-full" contentContainerStyle={
                      Platform.OS === "web"
                        ? { alignItems: "center", padding:2 }
                        : "items-center p-2"
                    }
                    horizontal={false}
                    keyboardShouldPersistTaps="handled"
                    >
                    <Pressable className="bg-accent w-full mt-4 h-12 items-center justify-center"
                      onPress={handleNewEvent}
                    > 
                      <Text>+ Event</Text>
                    </Pressable>
                    {eventTypes.map(event => (
                      <ListElement key={event.id} id={event.id} name={event.name} />
                    ))}

                  </BottomSheetScrollView>
              </BottomSheet>
            </GestureHandlerRootView>
          </SafeAreaView>
    );
  }
