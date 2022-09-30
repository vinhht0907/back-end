import { ApiProperty } from '@nestjs/swagger';
import { PagingParams } from '@/common/params/PagingParams';
import { IsOptional } from 'class-validator';

export class CommonFilterParams extends PagingParams{
  @ApiProperty()
  @IsOptional()
  keyword: string;
}
