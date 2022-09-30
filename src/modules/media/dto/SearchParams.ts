import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class SearchParams {
  @ApiProperty()
  @IsOptional()
  page: number;

  @ApiProperty()
  @IsOptional()
  length: number;

  @ApiProperty()
  @IsOptional()
  keyword: string;

  @ApiProperty()
  @IsOptional()
  orderBy: string;

  @ApiProperty()
  @IsOptional()
  orderType: string;
}
