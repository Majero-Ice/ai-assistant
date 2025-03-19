import {Injectable, Logger, OnModuleInit} from "@nestjs/common";
import {google} from "googleapis";
import {ConfigService} from "@nestjs/config";
import {Env} from "../enums/env";
import * as fs from "node:fs";
import * as path from "node:path";


@Injectable()
export class GoogleAPIService implements OnModuleInit{
    private oauth2Client
    private tokensPath = path.join(__dirname, '../../tokens.json');

    constructor(
        private readonly configService:ConfigService
    ) {
        this.oauth2Client = new google.auth.OAuth2(
            this.configService.get<string>(Env.GOOGLE_API_CLIENT_ID),
            this.configService.get<string>(Env.GOOGLE_API_CLIENT_SECRET),
            'https://d147-2a02-3037-305-d4fa-ecc9-83a4-3f9d-7ba9.ngrok-free.app/auth/callback',
        );
    }

    async onModuleInit() {
        await this.loadTokens();
    }

    async exchangeCodeForTokens(code: string) {
        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);
        fs.writeFileSync(this.tokensPath, JSON.stringify(tokens));

    }

    async getGoogleAccessToken(): Promise<string | null> {
        const tokens = this.oauth2Client.credentials;
        if (tokens && tokens.access_token) {
            return tokens.access_token;
        }
        Logger.log("Token was loaded successfully", GoogleAPIService.name)
        return this.refreshGoogleToken();
    }


    private async loadTokens() {
        if (fs.existsSync(this.tokensPath)) {
            const tokens = JSON.parse(fs.readFileSync(this.tokensPath, 'utf8'));
            if (tokens && tokens.access_token && tokens.refresh_token) {
                this.oauth2Client.setCredentials(tokens);
            }
        }
    }

    async refreshGoogleToken(): Promise<string | null> {
        if (!this.oauth2Client.credentials.refresh_token) {
            return null
        }
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        fs.writeFileSync(this.tokensPath, JSON.stringify(credentials));
        this.oauth2Client.setCredentials(credentials);
        Logger.log("Token was refreshed successfully", GoogleAPIService.name)
        return credentials.access_token;
    }

    async clearTokens() {
        if (fs.existsSync(this.tokensPath)) {
            fs.unlinkSync(this.tokensPath);
        }
        this.oauth2Client.setCredentials({});
    }

    async getAuthUrl(): Promise<string> {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: ['https://www.googleapis.com/auth/calendar'],
        });
    }

    public getOAuth2Client() {
        return this.oauth2Client;

    }
}

