import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, ObjectId } from 'mongoose';

export type HistoryType = 'default' | 'random' | 'test';

@Schema()
export class History extends Document {
    @ApiProperty()
    _id?: ObjectId;

    @ApiProperty()
    @Prop({ required: true })
    gameTitle: string;

    @ApiProperty()
    @Prop({ required: true })
    startTime: Date;

    @ApiProperty()
    @Prop({ required: true })
    numberOfPlayers: number;

    @ApiProperty()
    @Prop({ required: true })
    bestScore: number;
}

export const historySchema = SchemaFactory.createForClass(History);
historySchema.set('timestamps', true);
