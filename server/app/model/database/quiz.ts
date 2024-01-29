import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, ObjectId } from 'mongoose';
import { Question } from './question';

export type QuizDocument = Quiz & Document;

@Schema()
export class Quiz {
    @ApiProperty()
    _id?: ObjectId;

    @ApiProperty()
    @Prop({ required: true })
    name: string;

    @ApiProperty()
    @Prop({ required: true })
    duration: number;

    @ApiProperty()
    @Prop({ required: true, maxlength: 200, minlength: 10 })
    description: string;

    @ApiProperty()
    @Prop({ default: false })
    visibility: boolean;

    // TODO: Add questions
    @ApiProperty()
    // @Prop({type: () => [Question]})
    questions: Question[];

    @ApiProperty()
    createdAt?: Date;

    @ApiProperty()
    updatedAt?: Date;
}

export const quizSchema = SchemaFactory.createForClass(Quiz);

quizSchema.set('timestamps', true);
