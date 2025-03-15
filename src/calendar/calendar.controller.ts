import {Body, Controller, Delete, Get, Param, Post} from "@nestjs/common";
import {CalendarService} from "./calendar.service";
import {GetCalendarEventDto} from "./dto/get-calendar-event.dto";
import {CreateCalendarEventDto} from "./dto/create-calendar-event.dto";
import {calendar_v3} from "googleapis";


@Controller('calendar')
export class CalendarController {
    constructor(private readonly calendarService: CalendarService) {}

    @Post('events')
    async getCalendarEvents(@Body()dto:GetCalendarEventDto) {
        return await this.calendarService.getCalendarEvents(dto);
    }
    @Post('events/create')
     createCalendarEvents(@Body()dto:CreateCalendarEventDto[]) {
       return this.calendarService.createCalendarEvents(dto);
    }
    @Delete('events/:id')
    deleteCalendarEvent(@Param("id") eventId:string){
        return this.calendarService.deleteCalendarEvent(eventId)
    }
}


