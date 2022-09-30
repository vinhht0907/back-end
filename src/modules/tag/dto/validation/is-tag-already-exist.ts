import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import {Injectable} from '@nestjs/common';
import { TagService } from '@/modules/tag/tag.service';

@ValidatorConstraint({ name: 'isTagAlreadyExist', async: false })
@Injectable()
export class IsTagAlreadyExist implements ValidatorConstraintInterface {
  constructor(private readonly tagService: TagService) {}

  async validate(text: string, validationArguments: ValidationArguments) {
    // @ts-ignore
    const {id} = validationArguments.object;

    const result = await this.tagService.checkExist(text, id);
    return !result;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Tag đã tồn tại!';
  }
}
