import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty} from 'class-validator';

export class ResetPassword{
  @IsNotEmpty()
  @ApiProperty()
  _id: string

  @IsNotEmpty()
  @ApiProperty()
  code_forget_password: string

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
