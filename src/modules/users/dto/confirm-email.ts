import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty} from 'class-validator';

export class ConfirmEmail{
  @IsNotEmpty()
  @ApiProperty()
  _id: string

  @IsNotEmpty()
  @ApiProperty()
  code_active: string
}
