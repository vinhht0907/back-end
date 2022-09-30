import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthorToFollow {
  @IsNotEmpty()
  @ApiProperty()
  author: string;
}
