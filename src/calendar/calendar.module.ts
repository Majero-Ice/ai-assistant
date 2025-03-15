import {Module} from "@nestjs/common";
import {CalendarController} from "./calendar.controller";
import {CalendarService} from "./calendar.service";
import {TelegramService} from "../telegram/telegram.service";
import {AssistantService} from "../assistant/assistant.service";
import {WebSearchService} from "../web-search/webSearch.service";
import {ConfigService} from "@nestjs/config";


@Module({
    imports:[],
    controllers:[CalendarController],
    providers:[CalendarService, AssistantService, WebSearchService, TelegramService,ConfigService],
    exports:[CalendarService]
})
export class CalendarModule{}