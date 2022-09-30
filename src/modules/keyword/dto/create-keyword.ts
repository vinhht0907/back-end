import { IsNotEmpty, Validate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {IsKeywordAlreadyExist} from "@/modules/keyword/dto/validation/is-keyword-already-exist";

export class CreateKeyword {
    @IsNotEmpty()
    @Validate(IsKeywordAlreadyExist)
    @ApiProperty()
    name: string;

    @ApiProperty()
    @IsOptional()
    topics: any
}
