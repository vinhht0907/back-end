import { Allow } from 'class-validator';
import {CreateKeyword} from "@/modules/keyword/dto/create-keyword";

export class EditKeyword extends CreateKeyword{
    @Allow()
    private id?: string
}
