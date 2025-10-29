export type Time = {
    hours: number;
    minutes: number;
    seconds: number;
};

export type CalendarEvent = {
    summary: string;
    description?: string;
    start: {dateTime: string};
    end: {dateTime: string};
    colorId?: string;
};

export type EventType = {
    summary: string;
    description?: string;
    quota: Time;
    colorId: string;
};