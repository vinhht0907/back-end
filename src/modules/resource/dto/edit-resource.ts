import { Allow } from 'class-validator';
import {CreateResource} from "@/modules/resource/dto/create-resource";

export class EditResource extends CreateResource{
    @Allow()
    private id?: string
}
