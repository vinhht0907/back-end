import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateFcmToken {
  @ApiProperty()
  @IsOptional()
  readonly newToken: string;

  @ApiProperty()
  @IsOptional()
  readonly oldToken: string;
}
