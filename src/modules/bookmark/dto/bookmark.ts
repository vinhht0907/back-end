import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Bookmark {
  @IsNotEmpty()
  @ApiProperty()
  post_id: string;

  @IsOptional()
  @ApiProperty()
  chapter_id: string;
}
