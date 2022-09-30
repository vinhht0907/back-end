import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateProfile {
  @ApiProperty()
  @IsNotEmpty()
  readonly full_name: string;

  @ApiProperty()
  @IsOptional()
  readonly avatar: string;
}
