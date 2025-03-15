import { IsDateString } from 'class-validator';

export class GetCalendarEventDto {
    @IsDateString()
    timeMin: string;
    @IsDateString()
    timeMax: string;
}
