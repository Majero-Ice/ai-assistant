import {Module} from "@nestjs/common";
import {TelegramService} from "./telegram.service";
import { TelegrafModule } from 'nestjs-telegraf';
import {AssistantService} from "../assistant/assistant.service";
import {CalendarService} from "../calendar/calendar.service";
import {WebSearchService} from "../web-search/webSearch.service";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {Env} from "../enums/env";

@Module({
        imports: [
            ConfigModule,
            TelegrafModule.forRootAsync({
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => {
                    const token = configService.get<string>(Env.TELEGRAM_BOT_TOKEN);
                    if (!token) {
                        throw new Error('TELEGRAM_BOT_TOKEN не задан в .env файле!');
                    }
                    return { token };
                },
            }),
        ],
    controllers:[],
    providers:[CalendarService,TelegramService,AssistantService, WebSearchService],
    exports:[TelegramService]
})
export class TelegramModule{}