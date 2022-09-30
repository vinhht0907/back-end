import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreatePost {
  @IsNotEmpty()
  @Length(0, 200)
  @ApiProperty()
  title: string;

  @ApiProperty()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsOptional()
  content: string;

  @ApiProperty()
  @IsNotEmpty()
  categories: Array<string>;

  @ApiProperty()
  @IsNotEmpty()
  category_type: string;

  @ApiProperty()
  @IsNotEmpty()
  audience: string;

  @ApiProperty()
  @IsNotEmpty()
  post_status: string;

  @ApiProperty()
  @IsNotEmpty()
  publish_status: string;

  // @ApiProperty()
  // @IsOptional()
  // is_featured: boolean;

  @ApiProperty()
  @IsOptional()
  tags: Array<string | object>;
}
