import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PagingParams } from '@/common/params/PagingParams';
export class AuthorSearch extends PagingParams {
  @IsOptional()
  @ApiProperty()
  keyword: string;
}
