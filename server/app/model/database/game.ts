import { Message } from '@app/model/schema/message.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';
import { GameUser } from './game-user';
import { Quiz } from './quiz';

import { GameType } from '@common/types';

export type GameDocument = Game & Document;

@Schema()
export class Game {
    @ApiProperty()
    _id?: string;

    @ApiProperty({ type: () => [GameUser], default: [] })
    @Prop()
    users?: GameUser[];

    @ApiProperty()
    @Prop()
    quiz: Quiz;

    @ApiProperty({ enum: Object.values(GameType), default: 'default' })
    @Prop()
    gameType?: GameType;

    @ApiProperty()
    @Prop()
    isLocked: boolean;

    @ApiProperty({ type: () => [Message], default: [] })
    @Prop()
    messages?: Message[];

    @ApiProperty()
    @Prop()
    code: string;

    @ApiProperty()
    createdAt?: Date;

    @ApiProperty()
    updatedAt?: Date;
}

export const gameSchema = SchemaFactory.createForClass(Game);

gameSchema.set('timestamps', true);
