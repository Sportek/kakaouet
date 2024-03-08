import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';

export type GameUserDocument = GameUser & Document;

@Schema()
export class GameUser {
    @ApiProperty()
    _id?: ObjectId;

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
    @Prop({ default: true })
    isActive: boolean;

    @ApiProperty()
    @Prop({ default: 'WAITING' })
    answerState: string;

    @ApiProperty()
    @Prop({ default: 'PLAYER' })
    role: string;

    @ApiProperty()
    createdAt?: Date;

    @ApiProperty()
    updatedAt?: Date;
}

export const gameUserSchema = SchemaFactory.createForClass(GameUser);
gameUserSchema.set('timestamps', true);
