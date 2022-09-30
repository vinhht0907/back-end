import { IsNotEmpty, Validate, IsOptional, Length, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsCategoryAlreadyExist} from '@/modules/category/dto/validation/is-category-already-exist';

export class CreateCategory {
  @IsNotEmpty()
  @Validate(IsCategoryAlreadyExist)
  @Length(0,200)
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @ApiProperty()
  slug: string;

  @ApiProperty()
  @IsOptional()
  @Length(0,255)
  description: string;

  @IsNotEmpty()
  @ApiProperty()
  featured_image: string;

  @ApiProperty()
  @IsNotEmpty()
  parent_type: string;

  @ApiProperty()
  @IsOptional()
  status: boolean;

  @ApiProperty()
  @IsOptional()
  @Length(0,255)
  seo_keywords: boolean;


  @ApiProperty()
  @IsOptional()
  @Length(0,255)
  seo_description: boolean;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  order: number;
}
