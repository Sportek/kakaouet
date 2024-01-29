import { Quiz } from '@app/model/database/quiz';
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

    describe('getAllQuizzes', () => {
        it('should return an array of quizzes', async () => {
            await expect(controller.getAllQuizzes()).resolves.toEqual([mockQuiz]);
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
        it('should create and return a quiz', async () => {
            const newQuiz: Quiz = {
                name: 'New Quiz',
                duration: 45,
                description: 'Description for new quiz',
                visibility: false,
                questions: [],
            };
            await expect(controller.createQuiz(newQuiz)).resolves.toEqual(mockQuiz);
        });
    });

    describe('updateQuizById', () => {
        it('should update and return the quiz', async () => {
            const updatedQuiz: Quiz = {
                ...mockQuiz,
                name: 'Updated Test Quiz',
            };
            await expect(controller.updateQuiz('1', updatedQuiz)).resolves.toEqual(updatedQuiz);
        });
    });

    describe('deleteQuiz', () => {
        it('should delete the quiz', async () => {
            await expect(controller.deleteQuiz('1')).resolves.toBeNull();
        });
    });
});
