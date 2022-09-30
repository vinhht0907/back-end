import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ChangeAccountPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly old_password: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly new_password: string;
}
