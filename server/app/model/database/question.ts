import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';
import { Choice } from './choice';

export type QuestionType = 'QCM' | 'QRL';

@Schema()
export class Question {
    @ApiProperty()
    _id?: ObjectId;

    @ApiProperty()
    @Prop({ required: true, enum: ['QCM', 'QRL'] })
    type: QuestionType;

    @ApiProperty()
    @Prop({ required: true })
    label: string;

    @ApiProperty()
    @Prop({ required: true })
    points: number;

    @ApiProperty()
    choices?: Choice[];
}

export const questionSchema = SchemaFactory.createForClass(Question);
