import StopWatch from '@/src/components/StopWatch';
import { loadEventTypes, removeEventType } from '@/src/services/storage';
import { EventType } from '@/src/types/event';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useFocusEffect, useRouter } from 'expo-router';
import { cssInterop } from 'nativewind';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, ScrollView as RNScrollView, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { SafeAreaView } from "react-native-safe-area-context";
import uuid from 'react-native-uuid';
export const ScrollView = cssInterop(RNScrollView, {
  contentContainerStyle: true,
});

// Custom Swipeable Component using modern gesture APIs
function SwipeableListItem({ 
  id, 
  name, 
  onPress, 
  onDelete 
}: { 
  id: string; 
  name: string; 
  onPress: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const translateX = useSharedValue(0);
  const isSwiped = useSharedValue(false);
  const startX = useSharedValue(0);

  // Combined gesture that handles both horizontal swipe and vertical pass-through
  const panGesture = Gesture.Pan()
    .onBegin((event) => {
      startX.value = event.translationX;
    })
    .onUpdate((event) => {
      const deltaX = event.translationX - startX.value;
      
      // Only allow left swipe (negative translation)
      if (deltaX < 0) {
        translateX.value = Math.max(deltaX, -80);
      } else if (deltaX > 0 && isSwiped.value) {
        // Allow right swipe to close if already swiped
        translateX.value = Math.min(deltaX, 0);
      }
      // If deltaX > 0 and not swiped, let the gesture pass through to BottomSheet
    })
    .onEnd((event) => {
      const deltaX = event.translationX - startX.value;
      const velocityX = event.velocityX;
      
      const shouldOpen = deltaX < -40 || velocityX < -500;
      const shouldClose = deltaX > 20 || velocityX > 500;
      
      if (shouldOpen) {
        translateX.value = withSpring(-80);
        isSwiped.value = true;
      } else if (shouldClose) {
        translateX.value = withSpring(0);
        isSwiped.value = false;
      } else {
        // Return to previous state
        translateX.value = withSpring(isSwiped.value ? -80 : 0);
      }
    });

  // Tap gesture for item press
  const tapGesture = Gesture.Tap()
    .onEnd(() => {
      if (!isSwiped.value) {
        runOnJS(onPress)(id);
      } else {
        // Close swipe if tapped while open
        translateX.value = withSpring(0);
        isSwiped.value = false;
      }
    });

  // Combine gestures - race between tap and pan
  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -20 ? 1 : 0,
    transform: [{ translateX: translateX.value + 80 }],
  }));

  const handleDelete = () => {
    translateX.value = withSpring(0);
    runOnJS(onDelete)(id);
  };

  return (
    <View className="w-full mt-4 overflow-hidden rounded-lg">
      {/* Delete button that appears on swipe */}
      <Animated.View 
        style={deleteStyle}
        className="absolute right-0 top-0 bottom-0 w-20 bg-red-600 items-center justify-center z-10 rounded-r-lg"
      >
        <Pressable 
          onPress={handleDelete}
          className="w-full h-full items-center justify-center"
        >
          <Text className="text-white font-bold text-sm">Delete</Text>
        </Pressable>
      </Animated.View>
      
      {/* Main swipeable content */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={animatedStyle}>
          <View className="bg-accent w-full h-12 items-center justify-center rounded-lg">
            <Text className="text-white font-semibold">{name}</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

// Alternative approach using the old Swipeable with proper configuration
function SwipeableListItemLegacy({ 
  id, 
  name, 
  onPress, 
  onDelete 
}: { 
  id: string; 
  name: string; 
  onPress: (id: string) => void;
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
          onPress={() => onPress(id)}
        >
          <Text className="text-white font-semibold">{name}</Text>
        </Pressable>
      </Swipeable>
    </View>
  );
}

// Your existing functions remain the same...
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

export default function Index() {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["5%", "25%"], []);
  const router = useRouter();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [currentEvent, setCurrentEvent] = useState<string>();
  const [useModernSwipeable, setUseModernSwipeable] = useState(true);

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

  useFocusEffect(() => {
    let active = true;
    const load = async () => {
      const types = await loadEventTypes();
      if (active) setEventTypes(types);
    };
    load();
    return () => { active = false };
  });

  function handleNewEvent() {
    const id = uuid.v4() as string;
    router.push(`./event/${id}`);
  }

  function handleEventChange(eventId: string) {
    setCurrentEvent(eventId);
    console.log(`Selected event: ${eventId}`);
  }

  function handleEventDelete(eventId: string) {
    removeEventType(eventId);
    setEventTypes(prev => prev.filter(event => event.id !== eventId));
  }

  const SwipeableComponent = useModernSwipeable ? SwipeableListItem : SwipeableListItemLegacy;

  return (
    <SafeAreaView className="flex-1 bg-dark-200">
      <GestureHandlerRootView>
        <ScrollView className="flex-1" contentContainerStyle="flex items-center flex-grow">
          <View className="flex items-center flex-grow">
            <TouchableOpacity
              className="w-full bg-light-100 items-center mt-4 py-3 rounded-lg mx-4"
              onPress={createDummyCalendarEvent}
            >
              <Text className="text-dark-100 font-bold">Test Google Calendar API</Text>
            </TouchableOpacity>
            
            {/* Toggle for testing both approaches */}
            <TouchableOpacity
              className="w-full bg-blue-500 items-center mt-4 py-3 rounded-lg mx-4"
              onPress={() => setUseModernSwipeable(!useModernSwipeable)}
            >
              <Text className="text-white font-bold">
                Switch to {useModernSwipeable ? 'Legacy' : 'Modern'} Swipeable
              </Text>
            </TouchableOpacity>
            
            <Text className="text-5xl text-light-200 font-bold mt-12 mb-6 select-none" selectable={false}>
              RalCal
            </Text>
            <StopWatch />
          </View>
        </ScrollView>
        
        <BottomSheet
          ref={sheetRef}
          snapPoints={snapPoints}
          backgroundStyle={{ backgroundColor: '#1d0f4e' }}
          enableContentPanningGesture={true}
          enableHandlePanningGesture={true}
          // These help with gesture coordination
          activeOffsetY={[-5, 5]}
          activeOffsetX={[-10, 10]}
          failOffsetY={[-10, 10]}
        >
          <BottomSheetScrollView 
            className="w-full" 
            contentContainerStyle={
              Platform.OS === "web"
                ? { alignItems: "center", padding: 2 }
                : "items-center p-2"
            }
            horizontal={false}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable 
              className="bg-accent w-full mt-4 h-12 items-center justify-center rounded-lg mx-2"
              onPress={handleNewEvent}
            > 
              <Text className="text-white font-semibold">+ New Event Type</Text>
            </Pressable>
            
            {eventTypes.map(event => (
              <View key={event.id} className="w-full px-2">
                <SwipeableComponent
                  id={event.id}
                  name={event.name}
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