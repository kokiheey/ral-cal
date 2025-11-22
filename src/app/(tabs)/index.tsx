import StopWatch from '@/src/components/StopWatch';
import { createEvent } from '@/src/services/googleApi';
import { loadCurrentCalendar, loadEventTypes, loadStartTime, removeEventType } from '@/src/services/storage';
import { EventType } from '@/src/types/event';
import BottomSheet, { BottomSheetHandleProps, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useFocusEffect, useRouter } from 'expo-router';
import { cssInterop } from 'nativewind';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView as RNScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { SafeAreaView } from "react-native-safe-area-context";
import uuid from 'react-native-uuid';
export const ScrollView = cssInterop(RNScrollView, {
  contentContainerStyle: true,
});

// Alternative approach using the old Swipeable with proper configuration
function SwipeableComponent({ 
  id, 
  name, 
  eventType,
  onPress, 
  onDelete 
}: { 
  id: string; 
  name: string; 
  eventType: EventType;
  onPress: (id: EventType) => void;
  onDelete: (id: string) => void;
}) {
  const swipeableRef = useRef<any>(null);
  
  const renderRightActions = () => (
    <Pressable
      className="bg-red-600 w-20 h-12 items-center justify-center rounded-r-lg"
      onPress={() => {
        onDelete(id);
        swipeableRef.current?.close();
      }}
    >
      <Text className="text-white font-bold">Delete</Text>
    </Pressable>
  );

  return (
    <View className="w-full mt-4 rounded-lg overflow-hidden">
      <Swipeable
        ref={swipeableRef}
        friction={2}
        leftThreshold={30}
        rightThreshold={40}
        renderRightActions={renderRightActions}
        containerStyle={{ 
          backgroundColor: 'transparent',
          borderRadius: 8,
        }}
        childrenContainerStyle={{
          borderRadius: 8,
        }}
        onSwipeableWillOpen={(direction) => {
          // Prevent BottomSheet from handling gestures when swipeable is open
          console.log('Swipeable opening:', direction);
        }}
        onSwipeableClose={() => {
          // Re-enable BottomSheet gestures
          console.log('Swipeable closing');
        }}
      >
        <Pressable
          className="bg-accent w-full h-12 items-center justify-center rounded-lg"
          onPress={() => onPress(eventType)}
        >
          <Text className=" font-semibold">{name}</Text>
        </Pressable>
      </Swipeable>
    </View>
  );
}

GoogleSignin.configure({
  webClientId: '185106367353-ad0blf89be9979l4uech1ia91eja4fgt.apps.googleusercontent.com',
  scopes: [
    'https://www.googleapis.com/auth/calendar'
  ],
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: false,
  accountName: '',
  googleServicePlistPath: '',
  openIdRealm: '',
  profileImageSize: 120,
});



const BorderedHandle = (props: BottomSheetHandleProps) => (
  <View className="w-full items-center py-3 border-b-6 border-accent bg-dark-100 rounded-t-3xl">
    <View className="w-16 h-1 bg-gray-400 rounded-full" />
  </View>
);

export default function Index() {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["5%", "25%"], []);
  const router = useRouter();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [currentCalendar, setCurrentCalendar] = useState<string>();
  const [currentEvent, setCurrentEvent] = useState<EventType>();

  const startTimeRef = useRef<number>(0);
  const endTimeRef = useRef<number>(0);
  useEffect(() => {
    const boot = async () => {
      if (Platform.OS === 'web') return;
      try {
        const current = await GoogleSignin.getCurrentUser();
        let user;

        if (current) {
          user = current.user;
        } else {
          const resp = await GoogleSignin.signInSilently();
          user = resp.data?.user;
        }
        if (!user) throw new Error("No user??");
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

  useFocusEffect(
  React.useCallback(() => {
    let active = true;
    const load = async () => {
      const types = await loadEventTypes();
      if (active) setEventTypes(types);
      const calId = await loadCurrentCalendar();
      setCurrentCalendar(calId);
      console.log(calId);
      startTimeRef.current = await loadStartTime();
    };
    load();
    return () => { active = false };
  }, [])
  );
  function handleNewEvent() {
    const id = uuid.v4() as string;
    router.push(`./event/${id}`);
  }

  function handleEventChange(event: EventType) {
    setCurrentEvent(event);
    console.log(`Selected event: ${event.name}`);
  }

  function handleEventDelete(eventId: string) {
    removeEventType(eventId);
    setEventTypes(prev => prev.filter(event => event.id !== eventId));
  }

  async function stopWatchStart(){
    startTimeRef.current = await loadStartTime();
  }

  async function stopWatchStop(){
    endTimeRef.current = Date.now();
    if(currentCalendar && startTimeRef && endTimeRef && currentEvent)
      createEvent(currentCalendar, currentEvent, startTimeRef.current, endTimeRef.current);
  }



  return (
    <SafeAreaView className="flex-1 bg-dark-100">
      <GestureHandlerRootView>
         <Pressable
          className="absolute top-4 right-4 w-10 h-10 bg-gray-600 rounded-lg items-center justify-center z-50"
          onPress={() => router.push('/settings')}
        >
          <Text className="text-white text-lg">⚙️</Text>
        </Pressable>

        <ScrollView className="flex-1 bg-dark-100" contentContainerStyle="flex items-center flex-grow">
          <View className="flex items-center flex-grow">
            <Text className="text-5xl text-light-200 font-bold mt-12 mb-6 select-none" selectable={false}>
              RalCal
            </Text>
            <StopWatch onStart={stopWatchStart}  onStop={stopWatchStop}/>
          </View>
        </ScrollView>
        
        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          backgroundStyle={{ backgroundColor: 'transparent' }}
          handleComponent={BorderedHandle}
          enableContentPanningGesture={true}
          enableHandlePanningGesture={true}
          activeOffsetY={[-2, 2]}
          failOffsetX={[-20, 20]}
          style={{borderWidth:2, borderColor: '#fff', borderRadius: 25}}
        >
          <BottomSheetScrollView 
            className="w-full border-2 border-accent rounded-t-3xl" 
            contentContainerStyle={
              Platform.OS === "web"
                ? { alignItems: "center", padding: 2 }
                : "items-center p-2"
            }
            horizontal={false}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable 
              className="bg-accent w-full mt-2 h-12 items-center justify-center rounded-lg mx-2"
              onPress={handleNewEvent}
            > 
              <Text className="font-semibold">+ New Event Type</Text>
            </Pressable>
            
            {eventTypes.map(event => (
              <View key={event.id} className="w-full px-2">
                <SwipeableComponent
                  id={event.id}
                  name={event.name}
                  eventType={event}
                  onPress={handleEventChange}
                  onDelete={handleEventDelete}
                />
              </View>
            ))}
          </BottomSheetScrollView>
        </BottomSheet>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}