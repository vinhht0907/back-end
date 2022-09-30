import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ViewChapter {

  @IsNotEmpty()
  @ApiProperty()
  chapter: string;
}
