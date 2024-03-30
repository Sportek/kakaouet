import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsDate,
    IsDivisibleBy,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { ChoiceDto } from './choice.dto';
import { QUESTION_MAX_CHOICES, QUESTION_MAX_POINTS, QUESTION_MIN_CHOICES, QUESTION_MIN_POINTS } from './question.dto.constants';

export class QuestionDto {
    @IsString()
    type: string;

    @IsString()
    text: string;

    @IsNumber()
    @IsDivisibleBy(QUESTION_MIN_POINTS)
    @Min(QUESTION_MIN_POINTS)
    @Max(QUESTION_MAX_POINTS)
    points: number;

    @IsArray()
    @ArrayMinSize(QUESTION_MIN_CHOICES)
    @ArrayMaxSize(QUESTION_MAX_CHOICES)
    @ValidateNested({ each: true })
    @Type(() => ChoiceDto)
    @IsOptional()
    choices?: ChoiceDto[];

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    createdAt?: Date;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    lastModification?: Date;

    @Type(() => String)
    _id?: string;
}
