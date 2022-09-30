import { IsNotEmpty, Validate, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsUserAlreadyExist} from '@/modules/users/dto/validation/is-user-already-exist';

export class CreateUser {
  @IsNotEmpty()
  @Validate(IsUserAlreadyExist)
  @ApiProperty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  full_name: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  role: string

  @ApiProperty()
  @IsOptional()
  status: string
}
