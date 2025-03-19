import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import {Env} from "./enums/env";
import {ConfigService} from "@nestjs/config";
import {GoogleAPIService} from "./google-api/googleAPI.service";


@Injectable()
export class ProxyMiddleware implements NestMiddleware {
    constructor(private configService: ConfigService,
                private googleAPIService: GoogleAPIService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const googleAuthURI = await this.googleAPIService.getAuthUrl()

        const proxyMiddleware = createProxyMiddleware({

            target: googleAuthURI,
            changeOrigin: true,
            pathRewrite: {
                '^/auth/google': '',
            },
        });

        proxyMiddleware(req, res, next);
    }
}