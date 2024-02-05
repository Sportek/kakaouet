import { Question } from '@app/model/database/question';
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

    async updateQuestionById(id: string, question: Question) {
        try {
            const filter = { _id: id };
            await this.questionModel.replaceOne(filter, question);
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

    async addNewQuestion(question: Question) {
        try {
            await this.questionModel.create(question);
        } catch (error) {
            this.logger.error('Error adding new question: ', error);
        }
    }

    async validateQuestionObject(question: any): Promise<boolean> {

        const questionProperties = ['type', 'text', 'points', 'choices'];
      
        if (
          question &&
          typeof question === 'object' &&
          questionProperties.every(prop => Object.keys(question).includes(prop)) &&
          typeof question.type === 'string' &&
          typeof question.text === 'string' &&
          (question.type === 'QCM' || question.type === 'QCL') &&
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
