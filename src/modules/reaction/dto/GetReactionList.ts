import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetReactionList {
  @IsNotEmpty()
  @ApiProperty()
  chapter: string;

  @IsNotEmpty()
  @ApiProperty()
  reaction: string;
}
