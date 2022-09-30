import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class SlugParam {
  @IsNotEmpty()
  @ApiProperty()
  slug: string;
}
