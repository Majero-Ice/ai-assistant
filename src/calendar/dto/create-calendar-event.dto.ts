import {calendar_v3} from "googleapis";
import Schema$EventAttendee = calendar_v3.Schema$EventAttendee;


export class CreateCalendarEventDto {
    summary: string; // Название события
    description?: string; // Описание события
    location?: string; // Место проведения
    startDateTime: string; // Дата и время начала (ISO формат)
    endDateTime: string; // Дата и время окончания (ISO формат)
    attendees?: Schema$EventAttendee[]; // Email участников (по желанию)
}
