import { Allow } from 'class-validator';
import {CreateTopic} from "@/modules/topic/dto/create-topic";

export class EditTopic extends CreateTopic{
    @Allow()
    private id?: string
}
