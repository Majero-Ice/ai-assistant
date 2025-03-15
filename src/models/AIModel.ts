import OpenAI from "openai";
import {Logger} from "@nestjs/common";
import * as dotenv from 'dotenv';
import * as process from "node:process";

interface AIModelOptions {
    response_format?:{type:"json_object"},
}

export class AIModel{
    readonly #openAI:OpenAI
    readonly #devPrompt:string
    readonly #options:AIModelOptions | null
    #userContexts: { [userId: string]: any[] } = {};

    constructor(devPrompt:string , options?:AIModelOptions) {
        dotenv.config()
        this.#openAI = new OpenAI({
            apiKey:process.env.OPEN_AI_API_KEY
        })
        this.#devPrompt = devPrompt
        this.#options = options ?? null
    }

    async createCompletion(userId:string, userMessage:string,options?:AIModelOptions){
        if (!this.#userContexts[userId]) {
            this.#userContexts[userId] = [{role:'developer', content:this.#devPrompt}];
        }
        this.#userContexts[userId].push({ role: 'user', content: userMessage });
        const opt = options ?? this.#options
        try {

            const response = await this.#openAI.chat.completions.create({
                model:'gpt-4o-mini',
                messages:this.#userContexts[userId],
                store:true,
                ...opt
            });

            const isJSON = this.#options?.response_format?.type == "json_object" || options?.response_format?.type == "json_object"

            const botResponse = isJSON
                    ? JSON.parse(response.choices[0].message.content ?? '' ) || 'Нет ответа'
                    : response.choices[0].message.content || 'Нет ответа'

            Logger.warn(response.choices[0].message.content)
            this.addToContext(userId,botResponse)

            return botResponse
        } catch (error) {
            console.error('Ошибка при обращении к OpenAI:', error);
            return 'Произошла ошибка. Попробуй позже.'
        }
    }

    get openAI(): OpenAI {
        return this.#openAI;
    }

    private addToContext(userId, botResponse){
        this.#userContexts[userId].push({ role: 'assistant', content: JSON.stringify(botResponse) });

        if (this.#userContexts[userId].length > 20) {
            this.#userContexts[userId].shift();
        }
    }
}