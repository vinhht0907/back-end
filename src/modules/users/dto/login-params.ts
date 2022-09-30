import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty} from 'class-validator';

export class LoginParams{
  @IsNotEmpty()
  @ApiProperty()
  email: string

  @IsNotEmpty()
  @ApiProperty()
  _id: string
}
