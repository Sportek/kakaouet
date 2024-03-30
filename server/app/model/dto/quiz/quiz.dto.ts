import { QuestionDto } from '@app/model/dto/question/question.dto';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsNumber, IsOptional, IsString, Length, Max, Min, ValidateNested } from 'class-validator';
import { QUIZ_DESCRIPTION_MAX_LENGTH, QUIZ_DESCRIPTION_MIN_LENGTH, QUIZ_MAX_SECOND_TIME, QUIZ_MIN_SECOND_TIME } from './quiz.dto.constants';

export class QuizDto {
    @IsString()
    title: string;

    @IsNumber()
    @Min(QUIZ_MIN_SECOND_TIME)
    @Max(QUIZ_MAX_SECOND_TIME)
    duration: number;

    @IsString()
    @Length(QUIZ_DESCRIPTION_MIN_LENGTH, QUIZ_DESCRIPTION_MAX_LENGTH)
    description: string;

    @IsBoolean()
    @IsOptional()
    visibility?: boolean;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionDto)
    questions: QuestionDto[];

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    createdAt?: Date;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    lastModification?: Date;

    _id?: string;
}
