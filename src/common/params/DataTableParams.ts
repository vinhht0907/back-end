import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class DataTableParams{
  @ApiProperty()
  @IsOptional()
  start: any;

  @ApiProperty()
  @IsOptional()
  length: any;

  @ApiProperty()
  @IsOptional()
  draw: any;

  @ApiProperty()
  @IsOptional()
  order: any;

  @ApiProperty()
  @IsOptional()
  columns: any;

  @ApiProperty()
  @IsOptional()
  search: any;

  getDataTableParams() {
    const keyword = this.search ? this.search.value : ''
    const start = parseInt(this.start)
    const length = parseInt(this.length)

    let orderBy = null
    let orderType = null
    if (this.order) {
      const num = this.order[0].column
      orderBy = this.columns[num].data
      orderType = this.order[0].dir
    }

    return {
      start,
      length,
      draw: this.draw,
      orderBy,
      orderType,
      keyword,
    }
  }
}
