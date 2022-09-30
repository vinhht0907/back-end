import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PagingParams {
  @ApiProperty()
  @IsOptional()
  page: number;

  @ApiProperty()
  @IsOptional()
  length: number;

  @ApiProperty()
  @IsOptional()
  category: string;
}
