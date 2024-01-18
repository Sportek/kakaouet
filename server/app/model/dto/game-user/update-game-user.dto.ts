import { IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateGameUserDto {
    @IsString()
    @IsOptional()
    name: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    score?: number;

    @IsOptional()
    @IsBoolean()
    isExcluded?: boolean;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    // TODO: À rajouter avec les types
    // @IsOptional()
    // @IsEnum(AnswerState)
    // answerState?: AnswerState = AnswerState.Waiting;
}
