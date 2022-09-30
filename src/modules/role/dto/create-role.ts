import { IsNotEmpty, Validate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsRoleAlreadyExist } from '@/modules/role/dto/validation/is-role-already-exist';

export class CreateRole {
  @IsNotEmpty()
  @Validate(IsRoleAlreadyExist)
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @ApiProperty()
  display_name: string;

  @ApiProperty()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsOptional()
  permissionIdList: Array<string>
}
