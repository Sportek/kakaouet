import { Quiz, QuizDocument } from '@app/model/database/quiz';
import { QuizDto } from '@app/model/dto/quiz/quiz.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { mockQuizTable } from './mock-quiz';

@Injectable()
export class QuizService {
    constructor(
        @InjectModel(Quiz.name) public quizModel: Model<QuizDocument>,
        private readonly logger: Logger,
    ) {
        this.start();
    }
    async start() {
        if ((await this.quizModel.countDocuments()) === 0) {
            await this.populateDB();
        }
    }
    async populateDB(): Promise<void> {
        try {
            await this.quizModel.insertMany(mockQuizTable);
            this.logger.error('Succesfully populated db with quizzes');
        } catch (error) {
            this.logger.error('Error populating db with quizzes: ', error);
        }
    }

    async getAllQuizzes(): Promise<Quiz[]> {
        try {
            const quizzes: Quiz[] = await this.quizModel.find({});
            return quizzes;
        } catch (error) {
            this.logger.error('Error getting all quizzes: ', error);
        }
    }

    async getQuizById(id: string): Promise<Quiz> {
        try {
            const quiz: QuizDocument = await this.quizModel.findById(id);
            return quiz;
        } catch (error) {
            this.logger.error('Error getting quiz by id: ', error);
        }
    }

    async updateQuizById(id: string, quiz: QuizDto) {
        try {
            const filter = { _id: id };
            await this.quizModel.updateOne(filter, quiz);
            // eslint-disable-next-line no-underscore-dangle
            return await this.quizModel.findOne({ _id: quiz._id });
        } catch (error) {
            this.logger.error('Error updating quiz: ', error);
        }
    }

    async deleteQuizById(id: string) {
        try {
            await this.quizModel.deleteOne({ _id: id });
        } catch (error) {
            this.logger.error('Error deleting quiz: ', error);
        }
    }

    async addNewQuiz(quiz: QuizDto) {
        try {
            return await this.quizModel.create(quiz);
        } catch (error) {
            this.logger.error('Error adding new quiz: ', error);
        }
    }
}
