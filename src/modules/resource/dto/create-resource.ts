import { IsNotEmpty, Validate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {IsResourceAlreadyExist} from "@/modules/resource/dto/validate/is-resource-already-exist";

export class CreateResource {
    @IsNotEmpty()
    @Validate(IsResourceAlreadyExist)
    @ApiProperty()
    name: string;

    @IsNotEmpty()
    @ApiProperty()
    link: string;

    @IsNotEmpty()
    @ApiProperty()
    logo: string;

    @ApiProperty()
    @IsOptional()
    username: string;

    @ApiProperty()
    @IsOptional()
    password: string;
}
