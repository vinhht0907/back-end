import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TimeParamWithId{
  @IsNotEmpty()
  @ApiProperty()
  startTime: string;

  @IsNotEmpty()
  @ApiProperty()
  userId: string;
}
