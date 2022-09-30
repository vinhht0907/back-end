import { IsNotEmpty, Validate, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsPageAlreadyExist } from '@/modules/page/dto/validation/is-page-already-exist';

export class CreatePage {
  @IsNotEmpty()
  @Length(0,200)
  @ApiProperty()
  title: string;

  @IsNotEmpty()
  @ApiProperty()
  @Validate(IsPageAlreadyExist)
  slug: string;

  @ApiProperty()
  @IsOptional()
  @Length(0,255)
  description: string;

  @IsNotEmpty()
  @ApiProperty()
  content: string;

  @IsNotEmpty()
  @ApiProperty()
  seo: string;
}
