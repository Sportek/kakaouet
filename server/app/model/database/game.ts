import { GameType } from '@common/types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { GameUser } from './game-user';
import { Message } from './message';
import { Quiz } from './quiz';

@Schema()
export class Game {
    @ApiProperty()
    _id?: ObjectId;

    @ApiProperty()
    @Prop({ type: () => [GameUser] })
    users: GameUser[];

    @ApiProperty()
    @Prop({ type: () => Quiz })
    quiz: Quiz;

    @ApiProperty()
    @Prop({ type: () => GameType, default: GameType.Default })
    type: GameType;

    @ApiProperty()
    @Prop({ default: false })
    isLocked: boolean;

    @ApiProperty()
    @Prop({ required: true })
    code: string;

    @ApiProperty()
    @Prop({ default: [], type: () => [Message] })
    messages: Message[];

    @ApiProperty()
    createdAt?: Date;

    @ApiProperty()
    updatedAt?: Date;
}

export const gameSchema = SchemaFactory.createForClass(Game);
gameSchema.set('timestamps', true);
