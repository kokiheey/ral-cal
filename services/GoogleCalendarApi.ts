import { CalendarEvent } from "../types/CalendarEvent";
import { getAccessToken } from './GoogleAuth';


export async function createEvent (event: CalendarEvent, startTime: Date, endTime:Date){
    const accessToken = await getAccessToken();
}