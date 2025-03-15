// import {On, Start, Update,} from "nestjs-telegraf";
// import {TelegramService} from "./telegram.service";
//
//
// export class TelegramController{
//     constructor(
//         private readonly telegramService: TelegramService,
//     ) {}
//
//     async startCommand(ctx){
//         await this.telegramService.handleStartCommand(ctx)
//     }
//
//     async message(ctx){
//         await this.telegramService.onMessage(ctx)
//     }
//     @On('voice')
//     async voice(ctx){
//         await this.telegramService.onVoice(ctx)
//     }
//
// }