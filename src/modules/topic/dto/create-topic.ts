import { IsNotEmpty, Validate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTopic {
    @IsNotEmpty()
    @ApiProperty()
    name: string;

    @IsNotEmpty()
    @ApiProperty()
    link: string;

    @IsOptional()
    @ApiProperty()
    resources: any;

    @ApiProperty()
    @IsOptional()
    description: string;
}
