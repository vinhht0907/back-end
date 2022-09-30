import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PagingParams } from '@/common/params/PagingParams';

export class SearchTag extends PagingParams{
  @IsOptional()
  @ApiProperty()
  name: string;
}
