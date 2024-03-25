import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString, Min } from 'class-validator';

export class HistoryDto {
    @IsString()
    title: string;

    @IsDate()
    @Type(() => Date)
    date: Date;

    @IsNumber()
    @Min(1)
    numberOfPlayers: number;

    @IsNumber()
    @Min(0)
    bestScore: number;
}
