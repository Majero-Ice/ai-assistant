import {Controller, Get, Logger, Query, Res} from '@nestjs/common';
import { google } from 'googleapis';
import {GoogleAPIService} from "./googleAPI.service";

@Controller('auth')
export class GoogleAPIController {
    private readonly logger = new Logger(GoogleAPIController.name);
    constructor(private readonly googleAPIService: GoogleAPIService) {}

    @Get('login')
    async login(@Res() res) {
        const oauth2Client = this.googleAPIService.getOAuth2Client();

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/calendar'],
        });
        this.logger.log('Перенаправление на URL:', authUrl); // Вывод в консоль для отладки
        return res.redirect(authUrl); // Открывает страницу входа Google
    }

    @Get('callback')
    async callback(@Query('code') code: string, @Res() res) {
        console.log('Полученный код:', code);

        if (!code) {
            return res.status(400).send('Code отсутствует в запросе');
        }

        try {
            const tokens = await this.googleAPIService.getTokensFromCode(code);
            res.send('Успешно получены токены!');
        } catch (error) {
            console.error('Ошибка получения токенов:', error);
            res.status(500).send('Ошибка при получении токенов');
        }
    }
}
