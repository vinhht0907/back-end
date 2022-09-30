import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import {Injectable} from '@nestjs/common';
import { PermissionService } from '@/modules/permission/permission.service';
import {ResourceService} from "@/modules/resource/resource.service";

@ValidatorConstraint({ name: 'isResourceAlreadyExist', async: false })
@Injectable()
export class IsResourceAlreadyExist implements ValidatorConstraintInterface {
    constructor(private readonly resourceService: ResourceService) {}

    async validate(text: string, validationArguments: ValidationArguments) {
        // @ts-ignore
        const {id} = validationArguments.object;

        const result = await this.resourceService.checkExist(text, id);
        return !result;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Resource already exists!';
    }
}
