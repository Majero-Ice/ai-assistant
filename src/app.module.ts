import { Module } from '@nestjs/common';
import {TelegramModule} from "./telegram/telegram.module";
import {AssistantModule} from "./assistant/assistant.module";
import {CalendarModule} from "./calendar/calendar.module";
import {GoogleAPIModule} from "./google-api/googleAPI.module";
import {WebSearchModule} from "./web-search/webSearch.module";
import {ConfigModule} from "@nestjs/config";


@Module({
  imports: [
    TelegramModule,
    AssistantModule,
    CalendarModule,
    GoogleAPIModule,
    WebSearchModule,
    ConfigModule.forRoot()
  ]

})
export class AppModule {}

