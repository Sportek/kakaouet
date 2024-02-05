import { Quiz, QuizDocument } from '@app/model/database/quiz';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { mockQuizTable } from './mock-quiz';

const MIN_DURATION = 10;
const MAX_DURATION = 60;

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

    async updateQuizById(id: string, quiz: Quiz) {
        try {
            const filter = { _id: id };
            await this.quizModel.replaceOne(filter, quiz);
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

    async addNewQuiz(quiz: Quiz) {
        try {
            await this.quizModel.create(quiz);
        } catch (error) {
            this.logger.error('Error adding new quiz: ', error);
        }
    }

    async validateQuizObject(quiz): Promise<boolean> {
        const quizProperties = ['name', 'duration', 'description', 'visibility', 'questions'];

        if (
            quiz &&
            typeof quiz === 'object' &&
            quizProperties.every((prop) => Object.keys(quiz).includes(prop)) &&
            typeof quiz.name === 'string' &&
            typeof quiz.duration === 'number' &&
            quiz.duration >= MIN_DURATION &&
            quiz.duration <= MAX_DURATION &&
            typeof quiz.description === 'string' &&
            typeof quiz.visibility === 'boolean' &&
            Array.isArray(quiz.questions)
        ) {
            const questionsValidation = quiz.questions.every(async (question) => {
                await this.validateQuestionObject(question);
            });
            return questionsValidation;
        }

        return false;
    }

    async validateQuestionObject(question: any): Promise<boolean> {

        const questionProperties = ['type', 'text', 'points', 'choices'];
      
        if (
          question &&
          typeof question === 'object' &&
          questionProperties.every(prop => Object.keys(question).includes(prop)) &&
          typeof question.type === 'string' &&
          (question.type === 'QCM' || question.type === 'QCL') &&
          typeof question.text === 'string' &&
          typeof question.points === 'number' &&
          question.points % 10 === 0 && 
          question.points >= 10 && question.points <= 100 && 
          Array.isArray(question.choices) &&
          question.choices.length >= 2 && question.choices.length <= 4 
        ) {
          const choicesValidation = await Promise.all(
            question.choices.map(async (choice: any) => {
              return (
                choice &&
                typeof choice === 'object' &&
                'text' in choice &&
                'isCorrect' in choice &&
                typeof choice.text === 'string' &&
                typeof choice.isCorrect === 'boolean'
              );
            })
          );
      
          return choicesValidation.every(Boolean);
        }
      
        return false;
      }
}
