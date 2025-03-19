import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {TelegramModule} from "./telegram/telegram.module";
import {AssistantModule} from "./assistant/assistant.module";
import {CalendarModule} from "./calendar/calendar.module";
import {GoogleAPIModule} from "./google-api/googleAPI.module";
import {WebSearchModule} from "./web-search/webSearch.module";
import {ConfigModule} from "@nestjs/config";
import {APP_INTERCEPTOR} from "@nestjs/core";
import {TokenInterceptor} from "./token.interceptor";
import {ProxyMiddleware} from "./proxy.middleware";


@Module({
  imports: [
    TelegramModule,
    AssistantModule,
    CalendarModule,
    GoogleAPIModule,
    WebSearchModule,
    ConfigModule.forRoot()
  ],
  providers:[
      ProxyMiddleware,
    {

      provide: APP_INTERCEPTOR,
      useClass: TokenInterceptor,
    }
  ]

})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ProxyMiddleware).forRoutes('auth/google');
  }
}

