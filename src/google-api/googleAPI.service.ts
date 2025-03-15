import {Injectable} from "@nestjs/common";
import {google} from "googleapis";
import {ConfigService} from "@nestjs/config";
import {Env} from "../enums/env";


@Injectable()
export class GoogleAPIService{
    private readonly oauth2Client;

    constructor(
        private readonly configService:ConfigService
    ) {

        this.oauth2Client = new google.auth.OAuth2(
            this.configService.get<string>(Env.GOOGLE_API_CLIENT_ID),
            this.configService.get<string>(Env.GOOGLE_API_CLIENT_SECRET),
            'http://localhost:3000/auth/callback',
        );
    }

    async getTokensFromCode(code: string) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens); // Сохраняем токены в клиенте

            console.log('Токены получены:', tokens);
            return tokens;
        } catch (error) {
            throw new Error('Ошибка при обмене кода на токены: ' + error.message);
        }
    }
    public getOAuth2Client() {
        return this.oauth2Client;

    }
}

