import {Body, Controller, Get, Post, Query} from "@nestjs/common";
import {WebSearchService} from "./webSearch.service";


@Controller('web-search')
export class WebSearchController{

    constructor(private readonly webSearchService:WebSearchService) {
    }
    @Get('/search')
    async search(@Query('query') query:string){
        return await this.webSearchService.search(query)
    }
}