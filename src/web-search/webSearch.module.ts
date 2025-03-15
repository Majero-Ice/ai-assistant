import {Module} from "@nestjs/common";
import {WebSearchController} from "./webSearch.controller";
import {WebSearchService} from "./webSearch.service";
import {ConfigModule} from "@nestjs/config";


@Module({
    imports:[ConfigModule],
    controllers:[WebSearchController],
    providers:[WebSearchService],
    exports:[WebSearchService]

})
export class WebSearchModule{}