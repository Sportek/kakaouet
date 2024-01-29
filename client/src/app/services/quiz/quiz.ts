// import { Question } from './question';
import { Choice } from './choice';
export type QuestionType = 'QCM' | 'QRL';

export type QuizDocument = Quiz & Document;

export interface Quiz {
    _id?: string;
    name: string;
    duration: number;
    description: string;
    visibility: boolean;
    questions: Question[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Question {
    _id?: string;
    type: QuestionType;
    text: string;
    points: number;
    choices?: Choice[];
}
