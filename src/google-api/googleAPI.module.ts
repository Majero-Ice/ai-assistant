import {Global, Module} from "@nestjs/common";
import {GoogleAPIService} from "./googleAPI.service";
import {GoogleAPIController} from "./googleAPI.controller";
import {ConfigModule} from "@nestjs/config";


@Global()
@Module({
    imports:[ConfigModule],
    controllers:[GoogleAPIController],
    providers:[GoogleAPIService],
    exports:[GoogleAPIService]
})
export class GoogleAPIModule {

}