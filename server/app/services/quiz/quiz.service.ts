import { Quiz, QuizDocument } from '@app/model/database/quiz';
import { QuizDto } from '@app/model/dto/quiz/quiz.dto';
import { QuestionService } from '@app/services/question/question.service';
import { NUMBRE_OF_QCM_QUESTION, RANDOM_ID, RANDOM_PARAM } from '@common/constants';
import { QuestionFeedback, Quiz as QuizObjet } from '@common/types';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { mockQuizTable } from './mock-quiz';

@Injectable()
export class QuizService {
    randomId = RANDOM_ID;
    constructor(
        @InjectModel(Quiz.name) public quizModel: Model<QuizDocument>,
        private readonly logger: Logger,
        private questionService: QuestionService,
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

    async getQuizById(id: string): Promise<QuizDto> {
        try {
            const quiz: QuizDto = await this.quizModel.findById(id);
            return quiz;
        } catch (error) {
            this.logger.error('Error getting quiz by id: ', error);
        }
    }

    async updateQuizById(id: string, quiz: QuizDto) {
        try {
            const filter = { _id: id };
            quiz.lastModification = new Date();
            await this.quizModel.updateOne(filter, quiz);
            // _id est forcé par MongoDB, accepté par le prof
            // eslint-disable-next-line no-underscore-dangle
            return this.quizModel.findOne({ _id: quiz._id });
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
            quiz.createdAt = new Date();
            quiz.lastModification = new Date();
            return this.quizModel.create(quiz);
        } catch (error) {
            this.logger.error('Error adding new quiz: ', error);
        }
    }

    async doesQuizExist(title: string): Promise<boolean> {
        const quiz = await this.quizModel.findOne({ title });
        if (quiz) {
            return true;
        }
        return false;
    }
    async validateAnswers(quizId: string, questionId: number, answers: number[]): Promise<QuestionFeedback> {
        const quiz = await this.getQuizById(quizId);
        if (quiz) {
            const question = quiz.questions[questionId];
            if (question) {
                const correctChoicesIndices = question.choices.filter((choice) => choice.isCorrect).map((choice, index) => index);
                const isCorrect = correctChoicesIndices.length === answers.length && correctChoicesIndices.every((index) => answers.includes(index));
                return {
                    correctChoicesIndices,
                    isCorrect,
                    incorrectSelectedChoicesIndices: answers.filter((index) => !correctChoicesIndices.includes(index)),
                    correctSelectedChoicesIndices: answers.filter((index) => correctChoicesIndices.includes(index)),
                    points: isCorrect ? question.points : 0,
                };
            }
        }
        return null;
    }

    async generateRandomQuiz(): Promise<QuizObjet> {
        const qcmQuestions = await this.questionService.getQCMQuestions();
        const randomQuestions = qcmQuestions.sort(() => RANDOM_PARAM - Math.random()).slice(0, NUMBRE_OF_QCM_QUESTION);
        const randomQuiz: QuizObjet = {
            _id: this.randomId,
            title: 'Mode Aléatoire',
            description: 'Ce quiz est généré aléatoirement à partir des questions QCM.',
            duration: 20,
            visibility: true,
            questions: randomQuestions,
            createdAt: new Date(),
            lastModification: new Date(),
        };

        return randomQuiz;
    }
}
