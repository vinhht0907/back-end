import { IsEmail, IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsUserAlreadyExist } from '@/modules/users/dto/validation/is-user-already-exist';
export class UpdateFullProfile {
  @ApiProperty()
  @IsNotEmpty()
  readonly id: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly full_name: string;

  @ApiProperty()
  @IsOptional()
  readonly avatar: string;

  @ApiProperty()
  @IsEmail()
  @Validate(IsUserAlreadyExist)
  readonly email: string;

  @ApiProperty()
  @IsOptional()
  readonly password: string;
}
