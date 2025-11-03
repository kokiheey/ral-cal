import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

const EventEditor = () => {
  const { id } = useLocalSearchParams();

  return (
    <View className="bg-primary flex-1">
      <Text>EventEditor</Text>
    </View>
  )
}

export default EventEditor