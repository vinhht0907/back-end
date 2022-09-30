import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class KeywordRequiredParams {
  @ApiProperty()
  @IsNotEmpty()
  keyword: string;
}
