import { GameUser } from '@app/model/database/game-user';
import { Quiz } from '@app/model/database/quiz';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateGameDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => GameUser)
    @ApiProperty({ type: () => [GameUser] })
    users: GameUser[];

    // TODO: Vérifier si on doit avoir absolument un quiz ou non.
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => Quiz)
    @ApiProperty({ type: () => Quiz })
    quiz: Quiz;

    // TODO: Ajouter les différents types
    // @IsNotEmpty()
    // @IsString()
    // @ApiProperty({enum: GameType, default: GameType.Default})
    // gameType: GameType = GameType.Default;

    @IsBoolean()
    @IsOptional()
    isLocked?: boolean;

    // TODO: Ajouter les messages
    // @IsArray()
    // @ValidateNested({ each: true })
    // @Type(() => Message)
    // @ApiProperty({ type: () => [Message] })
    // messages: Message[];

    @IsString()
    code: string;
}
