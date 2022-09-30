import { IsNotEmpty, Validate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {IsPermissionAlreadyExist} from '@/modules/permission/dto/validation/is-permission-already-exist';

export class CreatePermission {
  @IsNotEmpty()
  @Validate(IsPermissionAlreadyExist)
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @ApiProperty()
  display_name: string;

  @ApiProperty()
  @IsOptional()
  description: string;
}
