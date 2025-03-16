import {CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor} from "@nestjs/common";
import {GoogleAPIService} from "./google-api/googleAPI.service";
import {catchError, Observable} from "rxjs";


@Injectable()
export class TokenInterceptor implements NestInterceptor {
    constructor(private googleAPIService: GoogleAPIService) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest()


        if (request.url?.includes('googleapis.com')) {
            const accessToken = await this.googleAPIService.getGoogleAccessToken();
            if (accessToken) {
                request.headers['Authorization'] = `Bearer ${accessToken}`;
            }
        }

        return next.handle().pipe(
            catchError(async (error) => {
                if (error.response?.status === 401) {
                    Logger.log('Token expired. Refreshing...');
                    try {
                        const newAccessToken = await this.googleAPIService.refreshGoogleToken();
                        if (newAccessToken) {
                            request.headers['Authorization'] = `Bearer ${newAccessToken}`;
                            return next.handle();
                        }
                    } catch (refreshError) {
                        Logger.log('Unable to refresh access token');
                        throw new Error('Unable to refresh access token');
                    }
                }
                throw error;
            })
        );
    }
}
