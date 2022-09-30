import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileWithField {
  @ApiProperty()
  @IsNotEmpty()
  readonly field: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly updateValue: string;
}
