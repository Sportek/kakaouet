import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString, Min } from 'class-validator';

export class HistoryDto {
    @IsString()
    gameTitle: string;

    @IsDate()
    @Type(() => Date)
    startTime: Date;

    @IsNumber()
    @Min(1)
    numberOfPlayers: number;

    @IsNumber()
    @Min(0)
    bestScore: number;
}
