import { IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Vote {
  @IsNotEmpty()
  @ApiProperty()
  post: string;

  @IsNotEmpty()
  @ApiProperty()
  review: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsBoolean()
  is_vote: boolean;

}
