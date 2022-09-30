import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateStatus {
  @ApiProperty()
  @IsNotEmpty()
  readonly id: string;

  @IsNotEmpty()
  @ApiProperty()
  readonly status: boolean;
}
