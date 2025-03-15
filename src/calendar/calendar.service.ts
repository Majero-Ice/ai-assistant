import {Injectable, Logger} from "@nestjs/common";
import {GoogleAPIService} from "../google-api/googleAPI.service";
import { GetCalendarEventDto} from "./dto/get-calendar-event.dto";
import {calendar_v3, google} from "googleapis";
import {Prompts} from "../assistant/prompts";
import {CreateCalendarEventDto} from "./dto/create-calendar-event.dto";
import Schema$Event = calendar_v3.Schema$Event;
import {AIModel} from "../models/AIModel";
import axios from "axios";


@Injectable()
export class CalendarService{

    #calendarAIModel:AIModel

    constructor(private readonly googleService: GoogleAPIService) {
        this.#calendarAIModel = new AIModel(Prompts.CALENDAR)
    }


   async createCalendarEvents(dto:CreateCalendarEventDto[]){
        const calendar = google.calendar({ version: 'v3', auth: this.googleService.getOAuth2Client() });
        //const userEmail = await this.googleService.getOAuth2Client().userinfo.get()
        const eventsRequestObjects = this.createEventRequestObjects(dto,"")

        const newEvents = await Promise.all(eventsRequestObjects.map(async (event) =>{
            try {
               const newEvent = await calendar.events.insert({
                    calendarId:"primary",
                    requestBody:event
                })
                return newEvent.data;

            }catch (error){
                console.error('Ошибка при создании события:', error);
                throw new Error('Не удалось создать событие в Google Calendar');
            }
        }))
       return newEvents
   }

   private createEventRequestObjects(dto:CreateCalendarEventDto[], userEmail:string){
      return dto.map( (dto) =>{
            const event:Schema$Event = {
                summary: dto.summary,
                description: dto.description || '',
                location: dto.location || '',
                start: {
                    dateTime: dto.startDateTime,
                    timeZone: 'Europe/Berlin',
                },
                end: {
                    dateTime: dto.endDateTime,
                    timeZone: 'Europe/Berlin',
                },
                attendees: dto.attendees || []
            }
            return event
        })
   }

    async deleteCalendarEvent(eventId:string){
        const calendar = google.calendar({ version: 'v3', auth: this.googleService.getOAuth2Client()});
        try {
            await calendar.events.delete({
                calendarId:'primary',
                eventId
            })
        }catch (e) {

        }
    }

    async askCalendar(userId:string,{userMessage, response}){
       const {url,method,data} = await this.#calendarAIModel
           .createCompletion(userId,JSON.stringify(userMessage,response), {response_format:{type:"json_object"}})

       Logger.warn(url)
       Logger.warn(method)
       Logger.warn(data)

           try {
               const calendarResponse = await axios({
                   url,
                   method,
                   data
               })
               Logger.warn(calendarResponse.data)
               const responseData = calendarResponse.data ?? data
               const modelResponse = await this.#calendarAIModel.createCompletion(userId,JSON.stringify(responseData))
               return modelResponse.toString()
           }catch (e){
            Logger.error("Filed to load data from Google Calendar API", e)
           }
    }


    async getCalendarEvents({timeMin,timeMax}:GetCalendarEventDto) {
        const calendar = google.calendar({ version: 'v3', auth: this.googleService.getOAuth2Client() });
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date(timeMin).toISOString(),
            timeMax: new Date(timeMax).toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        return response.data.items;
    }
}