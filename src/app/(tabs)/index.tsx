import StopWatch from '@/src/components/StopWatch';
import { addEventType, loadEventTypes } from '@/src/services/storage';
import { EventType } from '@/src/types/event';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
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
        <TouchableOpacity className="w-full bg-accent">
          <Text className="text-bold">{name}</Text>
        </TouchableOpacity>
    )
}

export default function Index() {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["5%", "25%"], []);
  const router = useRouter();
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);

  useEffect(() =>{
    loadEventTypes().then(setEventTypes);
  }, []);

  function handleNewEvent(){
    const id = uuid.v4();
    const placeholder = {id, name:'', description:'', quota:0};
    addEventType(placeholder).then(() => router.push(`./event/${id}`));
  }



  return (
        <SafeAreaView className="flex-1 bg-dark-200">
         <GestureHandlerRootView >
          <ScrollView className="flex-1" contentContainerStyle="flex items-center flex-grow">
            <View className="flex items-center flex-grow">
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
