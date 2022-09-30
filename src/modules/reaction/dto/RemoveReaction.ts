import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RemoveReaction {
  @IsNotEmpty()
  @ApiProperty()
  chapter: string;
}
