import { IsBoolean, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { QUIZ_DESCRIPTION_MAX_LENGTH, QUIZ_DESCRIPTION_MIN_LENGTH, QUIZ_MIN_SECOND_TIME } from './quiz.dto.constants';

export class UpdateQuizDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    @Min(QUIZ_MIN_SECOND_TIME)
    @Max(QUIZ_MIN_SECOND_TIME)
    duration?: number;

    @IsOptional()
    @IsString()
    @Length(QUIZ_DESCRIPTION_MIN_LENGTH, QUIZ_DESCRIPTION_MAX_LENGTH)
    description?: string;

    @IsOptional()
    @IsBoolean()
    visibility?: boolean;

    // TODO: Rajouter avec les types
    // @IsOptional()
    // @ValidateNested({each: true})
    // @Type(() => UpdateQuestionDto)
    // questions?: UpdateQuestionDto[];
}
