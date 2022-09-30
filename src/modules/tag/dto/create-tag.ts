import { IsNotEmpty, IsOptional, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsTagAlreadyExist } from '@/modules/tag/dto/validation/is-tag-already-exist';

export class CreateTag {
  @IsNotEmpty()
  @Validate(IsTagAlreadyExist)
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @ApiProperty()
  slug: string;

  @IsOptional()
  @ApiProperty()
  status: boolean;
}
