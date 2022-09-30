import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import {Injectable} from '@nestjs/common';
import {CategoryService} from '@/modules/category/category.service';

@ValidatorConstraint({ name: 'isCategoryAlreadyExist', async: false })
@Injectable()
export class IsCategoryAlreadyExist implements ValidatorConstraintInterface {
  constructor(private readonly categoryService: CategoryService) {}

  async validate(text: string, validationArguments: ValidationArguments) {
    // @ts-ignore
    const {id} = validationArguments.object;

    const result = await this.categoryService.checkExist(text, id);
    return !result;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Category already exists!';
  }
}
