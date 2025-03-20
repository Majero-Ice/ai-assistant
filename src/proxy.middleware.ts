import {Injectable, Logger, NestMiddleware} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import {Env} from "./enums/env";
import {ConfigService} from "@nestjs/config";
import {GoogleAPIService} from "./google-api/googleAPI.service";
import * as url from "node:url";



@Injectable()
export class ProxyMiddleware implements NestMiddleware {
    private readonly logger = new Logger(ProxyMiddleware.name);

    constructor(
        private configService: ConfigService,
        private googleAPIService: GoogleAPIService
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        try {
            // Получаем динамическую ссылку на авторизацию Google
            const googleAuthURI = await this.googleAPIService.getAuthUrl();
            this.logger.log('Google Auth URL: ' + googleAuthURI);

            // Разбираем URL, чтобы использовать его части
            const parsedUrl = url.parse(googleAuthURI);
            if (!parsedUrl.host) {
                return res.status(500).send('Invalid Google Auth URL');
            }

            const proxyMiddleware = createProxyMiddleware({
                target: `https://${parsedUrl.host}`, // Динамический хост
                changeOrigin: true,
                followRedirects: true, // Обрабатываем редиректы
                pathRewrite: { '^/auth/google': parsedUrl.path || '' },
                headers: {
                    'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0', // Имитация обычного браузера
                    Referer: 'https://www.google.com/',
                },
                on: {
                    proxyReq: (proxyReq, req, res) => {
                        // Устанавливаем заголовок 'Host' перед отправкой запроса
                        if (!res.headersSent) {
                            proxyReq.setHeader('Host', parsedUrl.host || '');
                            this.logger.log('Setting header for proxy request');
                        }
                    },
                    proxyRes: (proxyRes, req, res) => {
                        if (!res.headersSent) {
                            this.logger.log('Proxy response headers:', proxyRes.headers);
                        }
                    }
                }
            });

            proxyMiddleware(req, res, next);
        } catch (error) {
            this.logger.error('Error during proxy middleware processing:', error);
            next(error);
        }
    }
}