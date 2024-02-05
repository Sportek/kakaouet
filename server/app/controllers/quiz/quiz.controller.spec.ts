import { QuizService } from '@app/services/quiz/quiz.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { QuizController } from './quiz.controller';

describe('QuizController', () => {
    let controller: QuizController;
    let service: QuizService;

    const mockQuiz = {
        name: 'Test Quiz',
        duration: 30,
        description: 'A test quiz',
        visibility: true,
        questions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuizController],
            providers: [
                {
                    provide: QuizService,
                    useValue: {
                        getAllQuizzes: jest.fn().mockResolvedValue([mockQuiz]),
                        getQuizById: jest.fn().mockResolvedValue(mockQuiz),
                        addNewQuiz: jest.fn().mockResolvedValue(mockQuiz),
                        updateQuizById: jest.fn().mockResolvedValue({ ...mockQuiz, name: 'Updated Test Quiz' }),
                        deleteQuizById: jest.fn().mockResolvedValue(null),
                        validateQuizObject: jest.fn(),
                        validateQuestionObject: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<QuizController>(QuizController);
        service = module.get<QuizService>(QuizService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getQuizById', () => {
        it('should return entire quiz object if index is not provided', async () => {
            jest.spyOn(service, 'getQuizById').mockResolvedValue(mockQuiz);
            const result = await controller.getQuizById('1');
            expect(result).toEqual(mockQuiz);
        });

        it('should return array of correct choices indices if index is provided', async () => {
            jest.spyOn(service, 'getQuizById').mockResolvedValue({
                name: 'Quiz 1',
                duration: 60,
                description: 'This is the description of question 1',
                visibility: true,
                questions: [
                    {
                        type: 'QCM',
                        label: 'What is the capital of France?',
                        points: 10,
                        choices: [
                            { label: 'Paris', isCorrect: true },
                            { label: 'Berlin', isCorrect: false },
                            { label: 'London', isCorrect: false },
                            { label: 'Madrid', isCorrect: false },
                        ],
                    },
                ],
            });

            const result = await controller.getQuizById('1', 0);
            expect(result).toEqual([0]);
        });
    });

    describe('getQuizById', () => {
        it('should return a quiz if found', async () => {
            await expect(controller.getQuizById('1')).resolves.toEqual(mockQuiz);
        });

        it('should throw an error if the quiz is not found', async () => {
            jest.spyOn(service, 'getQuizById').mockResolvedValueOnce(null);
            await expect(controller.getQuizById('2')).rejects.toThrow(new HttpException('Quiz not found', HttpStatus.NOT_FOUND));
        });
    });

    describe('createQuiz', () => {
        it('should throw an error for an invalid quiz object', async () => {
            jest.spyOn(service, 'validateQuizObject').mockResolvedValueOnce(false);
            await expect(controller.createQuiz(mockQuiz)).rejects.toThrow(new HttpException('Invalid quiz object', HttpStatus.BAD_REQUEST));
        });
    });

    describe('updateQuiz', () => {
        it('should throw an error for an invalid quiz object', async () => {
            jest.spyOn(service, 'validateQuizObject').mockResolvedValueOnce(false);
            await expect(controller.updateQuiz('1', mockQuiz)).rejects.toThrow(new HttpException('Invalid quiz object', HttpStatus.BAD_REQUEST));
        });
    });

    describe('deleteQuiz', () => {
        it('should delete the quiz', async () => {
            await expect(controller.deleteQuiz('1')).resolves.toBeNull();
        });
    });
});
