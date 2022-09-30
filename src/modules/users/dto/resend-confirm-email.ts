import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty} from 'class-validator';

export class ResendConfirmEmail{
  @IsNotEmpty()
  @ApiProperty()
  _id: string
}
