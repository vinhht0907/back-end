import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class FilterDatatable {

  @IsOptional()
  @ApiProperty()
  title: string;

  @ApiProperty()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsOptional()
  categories: Array<string>;

  @ApiProperty()
  @IsOptional()
  category_type: string;
}
