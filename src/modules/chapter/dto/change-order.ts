import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ChangeOrder {
  @IsNotEmpty()
  @ApiProperty()
  postId: string;

  @IsNotEmpty()
  @ApiProperty()
  arrayId: Array<string>;
}
