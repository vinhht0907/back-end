import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class IdParam {
  @IsNotEmpty()
  @ApiProperty()
  id: string;
}
