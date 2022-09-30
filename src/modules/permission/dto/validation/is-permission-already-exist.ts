import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import {Injectable} from '@nestjs/common';
import { PermissionService } from '@/modules/permission/permission.service';

@ValidatorConstraint({ name: 'isPermissionAlreadyExist', async: false })
@Injectable()
export class IsPermissionAlreadyExist implements ValidatorConstraintInterface {
  constructor(private readonly permissionService: PermissionService) {}

  async validate(text: string, validationArguments: ValidationArguments) {
    // @ts-ignore
    const {id} = validationArguments.object;

    const result = await this.permissionService.checkExist(text, id);
    return !result;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Permission already exists!';
  }
}
