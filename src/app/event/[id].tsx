import { addEventType } from '@/src/services/storage';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EventEditor = () => {
  const { id } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  const handleEventCreate = () => {
    const quota = hours * 60 + minutes;

    const newEvent = {
      id: id as string,
      name,
      quota,
      description,
    };

    addEventType(newEvent);
  };
  return (
    <SafeAreaView className="bg-primary flex-1">
      <Text className="text-light-100 m-3 text-bold">Event name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Event name"
        placeholderTextColor="#999"
        className="border border-dark-400 p-3 rounded-x1 text-light-100"
      />
      <Text className="text-light-100 m-3 text-bold">Event description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Event description"
        placeholderTextColor="#999"
        className="border border-dark-400 p-3 rounded-x1 text-light-100"
      />
      <Text className="text-light-100 m-3 text-bold">Quota hours</Text>

      <Text className="text-light-100 m-3 text-bold">Quota minutes</Text>

      <Pressable onPress={handleEventCreate}>
        <Text>Create New Event</Text>
      </Pressable>
    </SafeAreaView>
  )
}

export default EventEditor