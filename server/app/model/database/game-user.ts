import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type GameUserDocument = GameUser & Document;

@Schema()
export class GameUser {
    @ApiProperty()
    _id?: string;

    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ default: 0 })
    score: number;

    @ApiProperty()
    @Prop({ default: false })
    isExcluded: boolean;

    @ApiProperty()
    @Prop({ default: false })
    isActive: boolean;

    // TODO: Add types
    // @ApiProperty({ enum: ['waiting', 'playing', 'finished'], default: 'waiting' })
    // answerState: AnswerState;

    @ApiProperty()
    createdAt?: Date;

    @ApiProperty()
    updatedAt?: Date;
}

export const gameUserSchema = SchemaFactory.createForClass(GameUser);

gameUserSchema.set('timestamps', true);
