import { Question } from '@app/model/database/question';
import { QuestionDto } from '@app/model/dto/question/question.dto';
import { Choice, Question as CommonQuestion, QuestionType as CommonQuestionType } from '@common/types';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { mockQuestions } from './mock-question';

@Injectable()
export class QuestionService {
    constructor(
        @InjectModel(Question.name) public questionModel: Model<Question>,
        private readonly logger: Logger,
    ) {
        this.start();
    }
    async start() {
        if ((await this.questionModel.countDocuments()) === 0) {
            await this.populateDB();
        }
    }
    async populateDB(): Promise<void> {
        try {
            await this.questionModel.insertMany(mockQuestions);
        } catch (error) {
            this.logger.error('Error populating db with questions: ', error);
        }
    }

    async getAllQuestions(): Promise<Question[]> {
        try {
            const questions: Question[] = await this.questionModel.find({});
            return questions;
        } catch (error) {
            this.logger.error('Error getting all questions: ', error);
        }
    }

    async getQuestionById(id: string): Promise<Question> {
        try {
            const question: Question = await this.questionModel.findById(id);
            return question;
        } catch (error) {
            this.logger.error('Error getting question by id: ', error);
        }
    }

    async updateQuestionById(id: string, question: QuestionDto) {
        try {
            const filter = { _id: id };
            question.lastModification = new Date();
            await this.questionModel.replaceOne(filter, question);
            // _id est forcé par MongoDB, accepté par le prof
            // eslint-disable-next-line no-underscore-dangle
            return this.questionModel.findOne({ _id: question._id });
        } catch (error) {
            this.logger.error('Error updating question: ', error);
        }
    }

    async deleteQuestionById(id: string) {
        try {
            await this.questionModel.deleteOne({ _id: id });
        } catch (error) {
            this.logger.error('Error deleting question: ', error);
        }
    }

    async deleteAllQuestions() {
        try {
            await this.questionModel.deleteMany({});
        } catch (error) {
            this.logger.error('Error deleting questions: ', error);
        }
    }

    async addNewQuestion(question: QuestionDto) {
        try {
            question.lastModification = new Date();
            question.createdAt = new Date();
            return this.questionModel.create(question);
        } catch (error) {
            this.logger.error('Error adding new question: ', error);
        }
    }

    mapDbQuestionToCommonQuestion(dbQuestion: Question): CommonQuestion {
        return {
            // eslint-disable-next-line no-underscore-dangle
            _id: Question._id,
            text: dbQuestion.text,
            points: dbQuestion.points,
            createdAt: dbQuestion.createdAt,
            lastModification: dbQuestion.lastModification,
            type: dbQuestion.type as CommonQuestionType,
            choices: dbQuestion.choices as Choice[],
        };
    }
    async getQCMQuestions(): Promise<CommonQuestion[]> {
        const dbQuestions = await this.questionModel.find({ type: 'QCM' }).exec();
        return dbQuestions.map(this.mapDbQuestionToCommonQuestion);
    }
}
