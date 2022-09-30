import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReaction {
  @IsNotEmpty()
  @ApiProperty()
  post: string;

  @IsNotEmpty()
  @ApiProperty()
  chapter: string;

  @IsNotEmpty()
  @ApiProperty()
  reaction: string;
}
