import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class KeywordParams {
  @ApiProperty()
  @IsOptional()
  keyword: string;
}
