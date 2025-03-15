import {Injectable, } from "@nestjs/common";
import * as fs from "node:fs";
import {Prompts} from "./prompts";
import {CalendarService} from "../calendar/calendar.service";
import {TelegramService} from "../telegram/telegram.service";
import {ModuleRef} from "@nestjs/core";
import {AIModel} from "../models/AIModel";
import {ModelAI} from "../enums/ModelAI";
import {WebSearchService} from "../web-search/webSearch.service";



@Injectable()
export class AssistantService {
    #assistantAIModel: AIModel
    private telegramService: TelegramService;

    constructor(
        private readonly calendarService: CalendarService,
        private readonly webSearchService:WebSearchService,
        private readonly moduleRef: ModuleRef
    ) {
        this.#assistantAIModel = new AIModel(Prompts.ASSISTANT, {
            response_format: {type: "json_object"}
        })
    }

    onModuleInit() {
        this.telegramService = this.moduleRef.get(TelegramService, {strict: false});
    }

    async askAssistant(userId: string, userMessage: string): Promise<any> {

        const botResponse = await this.#assistantAIModel.createCompletion(userId, userMessage)

        await this.doAction(userId, userMessage, botResponse)
    }


    async doAction(userId:string, userMessage:string, openAIResponse:any){

        const {response, model} = openAIResponse
        try {
            await this.telegramService.sendMessage(userId,response)


            const AIResponse = await this.chooseAIModel(model,userId,{
                userMessage,
                response,
            })
            await this.telegramService.sendMessage(userId,AIResponse)
        }catch (e){
        }
    }

    async transcribeAudio(audioFilePath: string){

        try {
            const response = await this.#assistantAIModel.openAI.audio.transcriptions.create({
                file: fs.createReadStream(audioFilePath),
                model: "whisper-1",
                response_format: "text",
            });
            return response

        } catch (error) {
            console.error('Ошибка при транскрибировании аудио:', error?.response?.data || error.message);
            return "Ошибка при транскрибировании аудио";
        }
    }


    async chooseAIModel(model:ModelAI, userId:string, data){
        switch (model) {
            case ModelAI.ASSISTANT:
                break
            case ModelAI.CALENDAR:
                return await this.calendarService.askCalendar(userId, data)
            case ModelAI.WEB_SEARCH:
                return await this.webSearchService.askWebSearch(userId,data.userMessage)
        }
    }
}