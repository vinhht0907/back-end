import { IsNotEmpty, IsOptional, Length, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateComment {
  @IsNotEmpty()
  @ApiProperty()
  post: string;

  @IsOptional()
  @ApiProperty()
  chapter: string;

  @IsNotEmpty()
  @ApiProperty()
  @Length(0)
  content: string;

  @IsOptional()
  @ApiProperty()
  parent_comment: string;
}
