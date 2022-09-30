import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PagingParams } from '@/common/params/PagingParams';
export class Search extends PagingParams{

  @IsOptional()
  @ApiProperty()
  categories: Array<string>;

  @ApiProperty()
  @IsOptional()
  orderBy: string;

  @ApiProperty()
  @IsOptional()
  timeRange: string;
}
