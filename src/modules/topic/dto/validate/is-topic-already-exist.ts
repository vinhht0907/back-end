import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import {Injectable} from '@nestjs/common';
import {TopicService} from "@/modules/topic/topic.service";

@ValidatorConstraint({ name: 'isTopicAlreadyExist', async: false })
@Injectable()
export class IsResourceAlreadyExist implements ValidatorConstraintInterface {
    constructor(private readonly topicService: TopicService) {}

    async validate(text: string, validationArguments: ValidationArguments) {
        // @ts-ignore
        const {id} = validationArguments.object;

        const result = await this.topicService.checkExist(text, id);
        return !result;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Topic already exists!';
    }
}
