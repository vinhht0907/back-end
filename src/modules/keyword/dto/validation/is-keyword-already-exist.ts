import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import {Injectable} from '@nestjs/common';
import {KeywordService} from "@/modules/keyword/keyword.service";

@ValidatorConstraint({ name: 'isKeywordAlreadyExist', async: false })
@Injectable()
export class IsKeywordAlreadyExist implements ValidatorConstraintInterface {
    constructor(private readonly keywordService: KeywordService) {}

    async validate(text: string, validationArguments: ValidationArguments) {
        // @ts-ignore
        const {id} = validationArguments.object;

        const result = await this.keywordService.checkExist(text, id);
        return !result;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Keyword already exists!';
    }
}
