import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateNews {
  @IsNotEmpty()
  @Length(0, 200)
  @ApiProperty()
  title: string;

  @ApiProperty()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  content: string;

  @ApiProperty()
  @IsOptional()
  seo_keyword: string;

  @ApiProperty()
  @IsNotEmpty()
  category_type: string;

  @ApiProperty()
  @IsOptional()
  status: boolean;

  @ApiProperty()
  @IsOptional()
  featured_image: string;

  @ApiProperty()
  @IsOptional()
  tags: string;
}
