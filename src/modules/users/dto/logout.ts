import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
export class Logout {
  @ApiProperty()
  @IsOptional()
  readonly fcmToken: string;

}
