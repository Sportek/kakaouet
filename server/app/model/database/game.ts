import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { GameUser } from './game-user';
import { Quiz } from './quiz';

export type GameDocument = Game & Document;

@Schema()
export class Game {
    @ApiProperty()
    _id?: string;

    @ApiProperty({ type: () => [GameUser] })
    users: GameUser[];

    @ApiProperty()
    quiz: Quiz;

    // TODO: Ajouter les différents types
    // @ApiProperty({ enum: ['random', 'test', 'default'], default: 'default' })
    // gameType: GameType

    @ApiProperty()
    isLocked: boolean;

    // TODO: Ajouter les messages
    // @ApiProperty({type: () => [Message]})
    // messages: Message[];

    @ApiProperty()
    code: string;

    @ApiProperty()
    createdAt?: Date;

    @ApiProperty()
    updatedAt?: Date;
}

export const gameSchema = SchemaFactory.createForClass(Game);

gameSchema.set('timestamps', true);
