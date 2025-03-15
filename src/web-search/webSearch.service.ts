import {Injectable, Logger} from "@nestjs/common";
import {tavily} from "@tavily/core";
import {AIModel} from "../models/AIModel";
import {Prompts} from "../assistant/prompts";
import axios from "axios";
import {ConfigService} from "@nestjs/config";
import {Env} from "../enums/env";


@Injectable()
export class WebSearchService{
    readonly #tavily
    readonly #webSearchModelAI:AIModel

    constructor(
        private readonly configService:ConfigService
    ) {
        this.#tavily = tavily({
            apiKey:this.configService.get<string>(Env.TAVILY_API_KEY)
        })
        this.#webSearchModelAI = new AIModel(Prompts.WEB_SEARCH)
    }
   async search(query:string){
        return await this.#tavily.search(query,{
            maxResults: 3,
            includeAnswer: "basic",
            includeImages: true
        })
    }
   async askWebSearch(userId:string, query:string){
       const {url,method,data} = await this.#webSearchModelAI
           .createCompletion(userId,query, {response_format:{type:"json_object"}})

       Logger.warn(url)
       Logger.warn(method)
       Logger.warn(data)

       try {
           const calendarResponse = await axios({
               url,
               method,
               data
           })
           Logger.warn(calendarResponse.data)
           const responseData = calendarResponse.data ?? data
           const modelResponse = await this.#webSearchModelAI.createCompletion(userId,JSON.stringify(responseData))
           return modelResponse.toString()
       }catch (e){
           Logger.error("Filed to load data from Tavily API", e)
       }
        return await this.#webSearchModelAI.createCompletion(userId,query)
   }
}

