import { IsBoolean, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { QUIZ_DESCRIPTION_MAX_LENGTH, QUIZ_DESCRIPTION_MIN_LENGTH, QUIZ_MIN_SECOND_TIME } from './quiz.dto.constants';

export class UpdateQuizDto {
    @IsString()
    name: string;

    @IsNumber()
    @Min(QUIZ_MIN_SECOND_TIME)
    @Max(QUIZ_MIN_SECOND_TIME)
    duration?: number;

    @IsString()
    @Length(QUIZ_DESCRIPTION_MIN_LENGTH, QUIZ_DESCRIPTION_MAX_LENGTH)
    description: string;

    @IsOptional()
    @IsBoolean()
    visibility?: boolean;

    // @IsOptional()
    // @ValidateNested({each: true})
    // @Type(() => UpdateQuestionDto)
    // questions?: UpdateQuestionDto[];
}
