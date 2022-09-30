import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PagingParams } from '@/common/params/PagingParams';
export class TopSearch extends PagingParams {
  @ApiProperty()
  @IsOptional()
  orderBy: string;

  @ApiProperty()
  @IsOptional()
  timeRange: string;

  @ApiProperty()
  @IsOptional()
  skip: number;
}
