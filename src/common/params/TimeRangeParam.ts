import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TimeRangeParam {
  @IsNotEmpty()
  @ApiProperty()
  startTime: string;

  @IsNotEmpty()
  @ApiProperty()
  endTime: string;
}
