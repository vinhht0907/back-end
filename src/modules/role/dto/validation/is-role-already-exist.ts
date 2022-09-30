import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import {Injectable} from '@nestjs/common';
import { RoleService} from '@/modules/role/role.service';

@ValidatorConstraint({ name: 'isRoleAlreadyExist', async: false })
@Injectable()
export class IsRoleAlreadyExist implements ValidatorConstraintInterface {
  constructor(private readonly roleService: RoleService) {}

  async validate(text: string, validationArguments: ValidationArguments) {
    // @ts-ignore
    const {id} = validationArguments.object;

    const result = await this.roleService.checkExist(text, id);
    return !result;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Role already exists!';
  }
}
