import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import {Injectable} from '@nestjs/common';
import { PageService } from '@/modules/page/page.service';

@ValidatorConstraint({ name: 'isPageAlreadyExist', async: false })
@Injectable()
export class IsPageAlreadyExist implements ValidatorConstraintInterface {
  constructor(private readonly pageService: PageService) {}

  async validate(text: string, validationArguments: ValidationArguments) {
    // @ts-ignore
    const {id} = validationArguments.object;

    const result = await this.pageService.checkExist(text, id);
    return !result;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Page already exists!';
  }
}
