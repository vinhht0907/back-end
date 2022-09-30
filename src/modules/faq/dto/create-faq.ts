import { IsNotEmpty, Validate, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFaq {
  @IsNotEmpty()
  @Length(0,200)
  @ApiProperty()
  title: string;

  @IsNotEmpty()
  @ApiProperty()
  content: string;

  @ApiProperty()
  @IsOptional()
  type: string;

  @IsNotEmpty()
  @ApiProperty()
  order: number;

}
