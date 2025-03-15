import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from "@nestjs/config";
import {Env} from "./enums/env";


async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    logger: ['log', 'error', 'warn', 'debug', 'verbose']
  });
  const configService = app.get(ConfigService);

  const port = configService.get<number>(Env.PORT) || 3000;

  await app.listen(port);
}
bootstrap();
