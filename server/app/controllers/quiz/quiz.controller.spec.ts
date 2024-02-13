import { QuizDto } from '@app/model/dto/quiz/quiz.dto';
import { mockQuizTable } from '@app/services/quiz/mock-quiz';
import { QuizService } from '@app/services/quiz/quiz.service';
import { QuestionFeedback } from '@common/types';
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
                        validateAnswers: jest.fn(),
                        doesQuizExist: jest.fn(),
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
        it('should return an array of questions', async () => {
            await expect(controller.getAllQuizzes()).resolves.toEqual([mockQuiz]);
        });
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

        it('should return a quiz if found', async () => {
            await expect(controller.getQuizById('1')).resolves.toEqual(mockQuiz);
        });

        it('should throw an error if the quiz is not found', async () => {
            jest.spyOn(service, 'getQuizById').mockResolvedValueOnce(null);
            await expect(controller.getQuizById('2')).rejects.toThrow(new HttpException('Quiz not found', HttpStatus.NOT_FOUND));
        });

        it('should throw an error if the quiz is not found', async () => {
            jest.spyOn(service, 'getQuizById').mockResolvedValue(mockQuiz);
            try {
                await controller.getQuizById('quizId', 2);
            } catch (error) {
                expect(error).toBeInstanceOf(HttpException);
                expect(error.message).toBe('Question not found');
                expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
            }
        });
    });

    describe('createQuiz', () => {
        it('should create a new quiz', async () => {
            const quiz: QuizDto = mockQuizTable[0];
            await controller.createQuiz(quiz);
            expect(service.addNewQuiz).toHaveBeenCalledWith(quiz);
        });

        it('should throw a BadRequest exception if quiz with the same name already exists', async () => {
            const quiz: QuizDto = mockQuizTable[0];
            jest.spyOn(service, 'doesQuizExist').mockResolvedValue(true);
            await expect(controller.createQuiz(quiz)).rejects.toThrow(new HttpException('Quiz name has to be unique: ', HttpStatus.BAD_REQUEST));
            expect(service.addNewQuiz).not.toHaveBeenCalled();
        });
    });

    describe('updateQuiz', () => {
        it('should create a new quiz', async () => {
            const id = 'fakeID';
            const quizDto: QuizDto = mockQuizTable[0];
            await controller.updateQuiz(id, quizDto);
            expect(service.updateQuizById).toHaveBeenCalledWith(id, quizDto);
        });
    });

    describe('deleteQuiz', () => {
        it('should delete the quiz', async () => {
            await expect(controller.deleteQuiz('1')).resolves.toBeNull();
        });
    });

    describe('validateAnswers', () => {
        it('should return correct feedback for a valid request', async () => {
            // Mock the service method to return a valid feedback
            const mockFeedback: QuestionFeedback = {
                correctChoicesIndices: [0],
                isCorrect: true,
                incorrectSelectedChoicesIndices: [],
                correctSelectedChoicesIndices: [0],
                points: 10,
            };
            jest.spyOn(service, 'validateAnswers').mockResolvedValueOnce(mockFeedback);

            // Act
            const result = await controller.validateAnswers('quizId', 1, { answers: [0] });

            // Assert
            expect(result).toEqual(mockFeedback);
        });

        it('should throw an HttpException for an invalid request', async () => {
            // Mock the service method to return null (invalid request)
            jest.spyOn(service, 'validateAnswers').mockResolvedValueOnce(null);

            // Act and Assert
            await expect(controller.validateAnswers('invalidQuizId', 1, { answers: [0] })).rejects.toThrowError(HttpException);
        });
    });
});
