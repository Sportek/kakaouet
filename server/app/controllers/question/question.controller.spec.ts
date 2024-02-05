import { Question } from '@app/model/database/question';
import { QuestionService } from '@app/services/question/question.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { QuestionController } from './question.controller';

describe('QuestionController', () => {
    let controller: QuestionController;
    let service: QuestionService;

    const mockQuestion: Question = {
        type: 'QCM',
        text: 'What is NestJS?',
        points: 10,
        choices: [],
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuestionController],
            providers: [
                {
                    provide: QuestionService,
                    useValue: {
                        getAllQuestions: jest.fn().mockResolvedValue([mockQuestion]),
                        getQuestionById: jest.fn().mockResolvedValue(mockQuestion),
                        addNewQuestion: jest.fn().mockResolvedValue(mockQuestion),
                        updateQuestionById: jest.fn().mockResolvedValue({ ...mockQuestion, text: 'Updated Question' }),
                        deleteQuestionById: jest.fn().mockResolvedValue(undefined),
                        deleteAllQuestions: jest.fn().mockResolvedValue(undefined),
                        validateQuestionObject: jest.fn().mockResolvedValue(true),
                    },
                },
            ],
        }).compile();

        controller = module.get<QuestionController>(QuestionController);
        service = module.get<QuestionService>(QuestionService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getAllQuestions', () => {
        it('should return an array of questions', async () => {
            await expect(controller.getAllQuestions()).resolves.toEqual([mockQuestion]);
        });
    });

    describe('getQuestionById', () => {
        it('should return a question if found', async () => {
            await expect(controller.getQuestionById('1')).resolves.toEqual(mockQuestion);
        });

        it('should throw an error if the question is not found', async () => {
            jest.spyOn(service, 'getQuestionById').mockResolvedValueOnce(null);
            await expect(controller.getQuestionById('2')).rejects.toThrow(new HttpException('Not Found', HttpStatus.NOT_FOUND));
        });
    });

    describe('createQuestion', () => {
        it('should create and return a question if validation passes', async () => {
            jest.spyOn(service, 'validateQuestionObject').mockResolvedValue(true);
            jest.spyOn(service, 'addNewQuestion').mockResolvedValue();
            await expect(controller.createQuestion(mockQuestion)).resolves.toEqual('Question created successfully');
        });

        it('should throw HttpException with status 400 if validation fails', async () => {
            const invalidQuestion: Question = {
                type: 'QRL',
                text: 'New Question',
                points: 5,
                choices: [],
            };
            jest.spyOn(service, 'validateQuestionObject').mockResolvedValue(false);
            await expect(controller.createQuestion(invalidQuestion)).rejects.toThrowError(
                new HttpException('Invalid question object', HttpStatus.BAD_REQUEST),
            );
        });
    });

    describe('updateQuestion', () => {
        it('should update a question if validation passes', async () => {
            const updatedQuestion: Question = {
                ...mockQuestion,
                text: 'Updated Question',
            };
            jest.spyOn(service, 'validateQuestionObject').mockResolvedValue(true);
            jest.spyOn(service, 'updateQuestionById').mockResolvedValue();
            await expect(controller.updateQuestion('1', updatedQuestion)).resolves.toEqual('Question updated successfully');
        });

        it('should throw HttpException with status 400 if validation fails', async () => {
            const invalidQuestion: Question = {
                type: 'QRL',
                text: 'New Question',
                points: 5,
                choices: [],
            };
            jest.spyOn(service, 'validateQuestionObject').mockResolvedValue(false);
            await expect(controller.updateQuestion('1', invalidQuestion)).rejects.toThrowError(
                new HttpException('Invalid question object', HttpStatus.BAD_REQUEST),
            );
        });
    });

    describe('deleteQuestion', () => {
        it('should delete the question', async () => {
            await expect(controller.deleteQuestion('1')).resolves.toBeUndefined();
        });
    });

    describe('deleteAllQuestions', () => {
        it('should delete all questions', async () => {
            await expect(controller.deleteAllQuestions()).resolves.toBeUndefined();
        });
    });
});
