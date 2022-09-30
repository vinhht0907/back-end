import { IsNotEmpty, Validate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SentEmail {
  @IsNotEmpty()
  @ApiProperty()
  to: Array<string>;

  @IsNotEmpty()
  @ApiProperty()
  from: string;

  @ApiProperty()
  @IsOptional()
  cc: Array<string>;

  @ApiProperty()
  @IsOptional()
  subject: string;

  @ApiProperty()
  @IsOptional()
  text: string;

  @ApiProperty()
  @IsOptional()
  html: string;
}
