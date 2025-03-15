import {Module} from "@nestjs/common";
import {AssistantService} from "./assistant.service";
import {AssistantController} from "./assistant.controller";
import {CalendarService} from "../calendar/calendar.service";
import {TelegramService} from "../telegram/telegram.service";
import {GoogleAPIModule} from "../google-api/googleAPI.module";

import {WebSearchService} from "../web-search/webSearch.service";
import {ConfigModule, ConfigService} from "@nestjs/config";


@Module({
    imports:[
        GoogleAPIModule,
        ConfigModule
    ],
    controllers:[AssistantController],
    providers:[CalendarService,AssistantService, TelegramService, WebSearchService,ConfigService],
    exports:[AssistantService]
})

export class AssistantModule {}