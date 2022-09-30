import { Allow, IsOptional } from 'class-validator';
import { CreateTag } from '@/modules/tag/dto/create-tag';
import { ApiProperty } from '@nestjs/swagger';

export class EditTag extends CreateTag{
  @Allow()
  private id?: string
}
