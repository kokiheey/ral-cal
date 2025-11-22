import { Stack } from 'expo-router';
import React from 'react';
const _layout = () => {
  return (
    <Stack>
      <Stack.Screen 
        name="index"
        options={{headerShown:false}}
      />
      <Stack.Screen
        name="settings"
        options={{
          headerShown: true,
          title: "",
          headerTransparent: true,
          headerStyle: { backgroundColor: "transparent" },
        }}
      />
    </Stack>
  )
}

export default _layout