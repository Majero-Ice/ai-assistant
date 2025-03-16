import {Controller, Get, Logger, Query, Res} from '@nestjs/common';
import {GoogleAPIService} from "./googleAPI.service";
import {Response} from "express";


@Controller('auth')
export class GoogleAPIController {
    private readonly logger = new Logger(GoogleAPIController.name);
    constructor(private readonly googleAPIService: GoogleAPIService) {}

    @Get('login')
    async login(@Res() res: Response) {
        const authUrl = await this.googleAPIService.getAuthUrl()

        this.logger.log(`Redirecting to Google OAuth: ${authUrl}`);
        return res.redirect(authUrl);
    }

    @Get('callback')
    async callback(@Query('code') code: string, @Res() res: Response) {
        if (!code) {
            return res.status(400).send('Authorization code is missing');
        }

        try {
            await this.googleAPIService.exchangeCodeForTokens(code);
            this.logger.log('Tokens successfully received and stored');
            res.send('Authentication successful! Tokens saved.');
        } catch (error) {
            this.logger.error('Error exchanging code for tokens:', error);
            res.status(500).send('Failed to authenticate');
        }
    }

    @Get('logout')
    async logout(@Res() res: Response) {
        await this.googleAPIService.clearTokens();
        this.logger.log('User logged out and tokens cleared');
        res.send('Logged out successfully');
    }
}
