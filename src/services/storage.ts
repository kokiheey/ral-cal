import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventType } from '../types/event';

const EVENT_TYPES_KEY = 'event-types';
const STOPWATCH_KEY = 'stopwatch';
const STOPWATCH_RUNNING_KEY = 'stopwatch-running';
const SELECTED_CALENDAR_KEY = 'calendar-id';
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


export async function saveStartTime(time: number){
    await AsyncStorage.setItem(STOPWATCH_KEY, JSON.stringify(time));
}

export async function loadStartTime(): Promise<number>{
    const data = await AsyncStorage.getItem(STOPWATCH_KEY);
    if(!data) console.log("no stopwatch data found");
    return data ? JSON.parse(data) : Date.now();
}

export async function saveCurrentCalendar(id: string){
    await AsyncStorage.setItem(SELECTED_CALENDAR_KEY, id);
}

export async function loadCurrentCalendar() :Promise<string>{
    const data = await AsyncStorage.getItem(SELECTED_CALENDAR_KEY);
    if(!data) console.log("NO CALENDAR SELECTED");
    return data ? data : "0";
}

export async function saveStopWatchRunning(isRunning: boolean){
    await AsyncStorage.setItem(STOPWATCH_RUNNING_KEY, JSON.stringify(isRunning));
}

export async function loadStopWatchRunning(): Promise<boolean>{
    const data = await AsyncStorage.getItem(STOPWATCH_RUNNING_KEY);
    if(!data) console.log("NO stopwatch running data");
    return data ? JSON.parse(data) : false;
}