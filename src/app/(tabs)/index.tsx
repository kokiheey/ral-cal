import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { cssInterop } from 'nativewind';
import { useMemo, useRef } from 'react';
import { Platform, ScrollView as RNScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from "react-native-safe-area-context";
import { Circle, Svg } from 'react-native-svg';
export const ScrollView = cssInterop(RNScrollView, {
    contentContainerStyle: true,
});

function ListElement() {
    return(
      <>
        <View className="flex-1 w-full h-20 justify-center items-center bg-primary ">
          <Text className="text-light-200 font-bold text-2xl">Sigma</Text>
        </View>
      </>
    )
}

export default function Index() {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["5%", "25%", "50%"], []);

  return (
        <SafeAreaView className="flex-1 bg-dark-200">
         <GestureHandlerRootView >
          <ScrollView className="flex-1" contentContainerStyle="flex items-center flex-grow">
            <View className="flex items-center flex-grow">
              <Text className="text-5xl text-light-200 font-bold mt-12 mb-12">RalCal</Text>
              <View className="items-center justify-center mt-12 w-3/4 max-w-[300px] aspect-square">
                  <Text className="text-5xl text-light-100 font-bold absolute">00:00:00</Text>
                  <Svg width="100%" height="100%" viewBox="0 0 100 100">
                    <Circle cx="50" cy="50" r="45" stroke="tomato" strokeWidth="4" fill="none" />
                  </Svg>
              </View>
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
                      ? { justifyContent: "center", alignItems: "center" }
                      : "justify-center items-center"
                  }>
                 <ListElement />
                 <ListElement />
                 <ListElement />
                 <ListElement />
                 <ListElement />
                 <ListElement />
                 <ListElement />
                 <ListElement />
                 <ListElement />
                 <ListElement />
                 <ListElement />
                 <ListElement />
                 <ListElement />
                 <ListElement />
                 <ListElement />
                 <ListElement />
                 <ListElement />
                 <ListElement />
                 <ListElement />

                </BottomSheetScrollView>
            </BottomSheet>
          </GestureHandlerRootView>
         </SafeAreaView>
  );
}
