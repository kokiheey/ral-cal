import { getCalendarColors } from '@/src/services/googleApi';
import { addEventType, hasEventType, loadEventType } from '@/src/services/storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CalendarColor {
  background: string;
  foreground: string;
}

interface CalendarColors {
  [key: string]: CalendarColor;
}

const EventEditor = () => {
  const { id } = useLocalSearchParams();
  const eventId = Array.isArray(id) ? id[0] : id;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [colorId, setColorId] = useState('1');
  const [colors, setColors] = useState<CalendarColors>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (await hasEventType(eventId)) {
          const eventT = await loadEventType(eventId);
          if (eventT){
            setName(eventT.name);
            if(eventT.description) setDescription(eventT.description);
            setHours(eventT.quota/60);
            setMinutes(eventT.quota%60);
            setColorId(eventT.colorId);
          }
        }

        const calendarColors = await getCalendarColors();
        setColors(calendarColors);
      } catch (error) {
        console.error('Failed to load colors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleEventCreate = async () => {
    const quota = hours * 60 + minutes;
    if(!name) return;
    const newEvent = {
      id: id as string,
      name,
      quota,
      description,
      colorId 
    };

    await addEventType(newEvent);
    router.back();
  };

  const handleHoursChange = (text: string) => {
    const value = parseInt(text) || 0;
    setHours(Math.max(0, value));
  };

  const handleMinutesChange = (text: string) => {
    const value = parseInt(text) || 0;
    setMinutes(Math.max(0, Math.min(59, value))); 
  };

  return (
    <SafeAreaView className="bg-primary flex-1 p-4">
      <Text className="text-light-100 text-lg font-bold mb-2">Event name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Event name"
        placeholderTextColor="#999"
        className="border border-dark-400 p-3 rounded-xl text-light-100 mb-4"
      />
      
      <Text className="text-light-100 text-lg font-bold mb-2">Event description</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Event description"
        placeholderTextColor="#999"
        className="border border-dark-400 p-3 rounded-xl text-light-100 mb-4"
        multiline
        numberOfLines={3}
      />
      
      <Text className="text-light-100 text-lg font-bold mb-2">Duration</Text>
      <View className="flex-row mb-4">
        <View className="flex-1 mr-2">
          <Text className="text-light-100 mb-1">Hours</Text>
          <TextInput
            value={hours.toString()}
            onChangeText={handleHoursChange}
            placeholder="0"
            placeholderTextColor="#999"
            className="border border-dark-400 p-3 rounded-xl text-light-100 text-center"
            keyboardType="numeric"
          />
        </View>
        <View className="flex-1 ml-2">
          <Text className="text-light-100 mb-1">Minutes</Text>
          <TextInput
            value={minutes.toString()}
            onChangeText={handleMinutesChange}
            placeholder="0"
            placeholderTextColor="#999"
            className="border border-dark-400 p-3 rounded-xl text-light-100 text-center"
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text className="text-light-100 text-lg font-bold mb-2">Color</Text>
      {loading ? (
        <Text className="text-light-100 mb-4">Loading colors...</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <View className="flex-row">
            {Object.entries(colors).map(([colorKey, colorData]) => (
              <Pressable
                key={colorKey}
                onPress={() => setColorId(colorKey)}
                className={`w-12 h-12 rounded-full mx-1 border-2 ${
                  colorId === colorKey ? 'border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: colorData.background }}
              >
                {colorId === colorKey && (
                  <View className="flex-1 items-center justify-center">
                    <Text 
                      className="text-sm font-bold"
                      style={{ color: colorData.foreground }}
                    >
                      ✓
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}

      <View className="mt-auto">
        <Pressable 
          className="bg-accent items-center justify-center rounded-xl px-6 py-4"
          onPress={handleEventCreate}
          disabled={!name}
        >
          <Text className="text-white text-lg font-bold">Create Event Type</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};



export default EventEditor;