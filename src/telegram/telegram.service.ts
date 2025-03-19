import { Injectable } from '@nestjs/common';
import {Command, Context, InjectBot, On, Start, Update} from 'nestjs-telegraf';
import { AssistantService } from '../assistant/assistant.service';
import axios from 'axios';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import {Markup, Telegraf} from "telegraf";
import {ConfigService} from "@nestjs/config";
import {Env} from "../enums/env";
import {Routes} from "../enums/routes";


@Injectable()
@Update()
export class TelegramService{
    constructor(
        private readonly assistantService: AssistantService,
        private readonly configService:ConfigService,
        @InjectBot() private readonly bot: Telegraf
    ) {}

    @Start()
    handleStartCommand(@Context() ctx) {
        ctx.reply('Опять работа?');
    }

    @Command('auth')
    async auth(@Context() ctx){
        await ctx.reply(
            'Для авторизации нажмите кнопку ниже:',
            Markup.inlineKeyboard([
                Markup.button.webApp('Авторизоваться', Routes.GOOGLE_AUTH)
            ])
        );
    }

    @On('text')
     async onMessage(@Context() ctx) {
        const userMessage = ctx.message.text;
        const userId = ctx.from.id.toString();


        if (userMessage) {
            await this.assistantService.askAssistant(userId, userMessage)

        }
    }

    private async getFilePath(file_id:string) {

        const fileInfoUrl = `https://api.telegram.org/bot${this.configService.get(Env.TELEGRAM_BOT_TOKEN)}/getFile?file_id=${file_id}`;

        try {
            const response = await axios.get(fileInfoUrl);

            if (response.data.ok) {
                const filePath = response.data.result.file_path;
                return filePath
            }
        }catch (e){

        }
    }

    async sendMessage(userId, response:string){
        await this.bot.telegram.sendMessage(userId,response,{parse_mode:"Markdown"})
    }





    @On('voice')
    async onVoice(@Context() ctx){
        try{
         const file_id = ctx.message.voice.file_id
         const filePath = await this.getFilePath(file_id)

         const fileUrl = `https://api.telegram.org/file/bot${this.configService.get(Env.TELEGRAM_BOT_TOKEN)}/${filePath}`;
         //Скачиваем голосовое сообщение
         const oggPath = path.join(__dirname, 'voice.ogg');
         const mp3Path = path.join(__dirname, 'voice.mp3');

         const response = await axios({
             url: fileUrl,
             method: 'GET',
             responseType: 'stream',
         });

         const writer = fs.createWriteStream(oggPath);
         response.data.pipe(writer);

         writer.on('finish',  () => {
             ffmpeg(oggPath)
                 .toFormat('mp3')
                 .on('end',  async () => {
                     // Отправляем MP3 в Whisper API
                     const text = await this.assistantService.transcribeAudio(mp3Path);
                     if (text) {
                         const reply = await this.assistantService.askAssistant(String(ctx.message.chat.id), text);
                          ctx.reply(reply);
                     }
                     fs.unlinkSync(oggPath);
                     fs.unlinkSync(mp3Path);
                 })
                 .on('error', (err) => {
                     console.error('Ошибка конвертации аудио:', err);
                     ctx.reply('Произошла ошибка при обработке аудио.');
                 })
                 .save(mp3Path);
         });
         writer.on('error', (err) => {
             console.error('Ошибка загрузки аудио:', err);
             ctx.reply('Произошла ошибка при скачивании аудио.');
         });
     } catch (error) {
        console.error('Ошибка обработки голосового сообщения:', error);
         ctx.reply('Произошла ошибка при обработке голосового сообщения.');
    }
}



}