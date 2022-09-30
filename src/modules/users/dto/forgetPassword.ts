import { IsNotEmpty, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgetPassword {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;
}
