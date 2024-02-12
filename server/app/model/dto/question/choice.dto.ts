import { IsBoolean, IsString } from 'class-validator';

export class ChoiceDto {
    @IsString()
    label: string;

    @IsBoolean()
    isCorrect: boolean;
}
