import { IsNotEmpty, IsOptional, Length, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReview {
  @IsNotEmpty()
  @ApiProperty()
  post: string;

  @IsNotEmpty()
  @ApiProperty()
  @Length(10)
  content: string;

  @ApiProperty()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  score: number;
}
