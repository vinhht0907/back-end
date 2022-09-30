import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class SearchByIdParams {
  @ApiProperty()
  @IsNotEmpty()
  _id: string;
}
