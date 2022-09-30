import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class MarkRead {
  @ApiProperty()
  @IsNotEmpty()
  notificationId: string;
}
