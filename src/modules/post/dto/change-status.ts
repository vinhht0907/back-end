import { Allow, IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class ChangeStatus {
  @Allow()
  @ApiProperty()
  private _id?: string

  @ApiProperty()
  @IsOptional()
  status: boolean;

  @IsOptional()
  @Length(0,255)
  @ApiProperty()
  note: string;
}
