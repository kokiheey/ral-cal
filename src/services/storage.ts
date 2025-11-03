import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventType } from '../types/event';

const EVENT_TYPES_KEY = 'event-types';

export async function saveEventTypes(types: EventType[]){
    await AsyncStorage.setItem(EVENT_TYPES_KEY, JSON.stringify(types));
}

export async function loadEventTypes(): Promise<EventType[]> {
    const data = await AsyncStorage.getItem(EVENT_TYPES_KEY);
    return data ? JSON.parse(data) : [];
}

export async function addEventType(type: EventType){
    const existing = await loadEventTypes();
    const updated = [...existing, type];
    await saveEventTypes(updated);
}

export async function removeEventType(id: string){
    const existing = await loadEventTypes();
    const updated = existing.filter(t => t.id != id);
    await saveEventTypes(updated);
}

export async function modifyEventType(id: string, updatedFields: Partial<EventType>){
    const existing = await loadEventTypes();
    const updated = existing.map(event =>
        event.id == id ? {...event, ...updatedFields } : event
    );
    await saveEventTypes(updated);
}