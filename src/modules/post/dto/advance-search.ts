import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PagingParams } from '@/common/params/PagingParams';
export class AdvanceSearch extends PagingParams {
  @IsOptional()
  @ApiProperty()
  category_type: string;

  @IsOptional()
  @ApiProperty()
  categories: Array<string>;

  @ApiProperty()
  @IsOptional()
  orderBy: string;

  @ApiProperty()
  @IsOptional()
  title: string;

  @ApiProperty()
  @IsOptional()
  tags: Array<string>;

  @ApiProperty()
  @IsOptional()
  author: string;

  @ApiProperty()
  @IsOptional()
  post_status: string;

  @ApiProperty()
  @IsOptional()
  audience: string;
}
