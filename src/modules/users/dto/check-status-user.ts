import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckStatusUser {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
