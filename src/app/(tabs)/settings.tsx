import { getAvailableCalendars, GoogleCalendar } from '@/src/services/googleApi';
import { saveCurrentCalendar } from '@/src/services/storage';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
const settings = () => {

const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
const [selectedCalendar, setSelectedCalendar] = useState<string>('');


function changeCalendar(id: string){
  setSelectedCalendar(id);
  saveCurrentCalendar(id);
}
// Load calendars
useEffect(() => {
  const loadCalendars = async () => {
    try {
      const availableCalendars = await getAvailableCalendars();
      setCalendars(availableCalendars);
      
      // Auto-select primary calendar if available
      const primaryCalendar = availableCalendars.find(cal => cal.primary);
      if (primaryCalendar) {
        changeCalendar(primaryCalendar.id);
      } else if (availableCalendars.length > 0) {
        changeCalendar(availableCalendars[0].id);
      }
    } catch (error) {
      console.error('Failed to load calendars:', error);
    }
  };
  
  loadCalendars();
}, []);
  return (
    // In your render/return statement
<View className="p-4">
  <Text className="text-lg font-bold mb-4 text-white">Select Calendar</Text>
  
  {calendars.map(calendar => (
    <TouchableOpacity
        key={calendar.id}
        className={`p-4 mb-2 rounded-lg border-2 ${
          selectedCalendar === calendar.id 
            ? 'border-gray-200 bg-dark-200' 
            : 'border-gray-600 bg-dark-100'
        }`}
        onPress={() => changeCalendar(calendar.id)}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white font-semibold text-base">
              {calendar.summary}
              {calendar.primary && (
                <Text className="text-accent text-sm"> (Primary)</Text>
              )}
            </Text>
            {calendar.description && (
              <Text className="text-gray-400 text-sm mt-1">
                {calendar.description}
              </Text>
            )}
            <Text className="text-gray-500 text-xs mt-1">
              Access: {calendar.accessRole}
            </Text>
          </View>
          
          {calendar.backgroundColor && (
            <View 
              className="w-6 h-6 rounded-full ml-2"
              style={{ backgroundColor: calendar.backgroundColor }}
            />
          )}
        </View>
    </TouchableOpacity>
  ))}
</View>
  )
}

export default settings