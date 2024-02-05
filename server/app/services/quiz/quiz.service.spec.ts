import { Quiz } from '@app/model/database/quiz';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { mockQuizTable } from './mock-quiz';
import { QuizService } from './quiz.service';

const mockQuizModel = {
    find: jest.fn(),
    findById: jest.fn(),
    replaceOne: jest.fn(),
    deleteOne: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
    insertMany: jest.fn(),
};

describe('QuizService', () => {
    let service: QuizService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuizService,
                Logger,
                {
                    provide: getModelToken(Quiz.name),
                    useValue: mockQuizModel,
                },
            ],
        }).compile();

        service = module.get<QuizService>(QuizService);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('start', () => {
        it('should populate the database if no quizzes exist', async () => {
            mockQuizModel.countDocuments.mockReturnValueOnce(0);
            const populateDBSpy = jest.spyOn(service, 'populateDB');
            await service.start();
            expect(populateDBSpy).toHaveBeenCalled();
        });

        it('should not populate the database if quizzes already exist', async () => {
            mockQuizModel.countDocuments.mockReturnValueOnce(1);
            const populateDBSpy = jest.spyOn(service, 'populateDB');
            await service.start();
            expect(populateDBSpy).not.toHaveBeenCalled();
        });
    });

    describe('populateDB', () => {
        it('should log success message on successful population', async () => {
            const spyOnInsertMany = jest.spyOn(mockQuizModel, 'insertMany');
            await service.populateDB();
            expect(spyOnInsertMany).toHaveBeenCalledWith(mockQuizTable);
        });
    });

    describe('getAllQuizzes', () => {
        it('should return an array of quizzes', async () => {
            const expectedQuizzes = mockQuizTable;
            mockQuizModel.find.mockReturnValueOnce(expectedQuizzes);
            const result = await service.getAllQuizzes();
            expect(result).toEqual(expectedQuizzes);
        });

        it('should log an error if there is an exception', async () => {
            mockQuizModel.find.mockImplementationOnce(() => {
                throw new Error('Mocked error');
            });
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
            await service.getAllQuizzes();
            expect(loggerErrorSpy).toHaveBeenCalledWith('Error getting all quizzes: ', expect.any(Error));
        });
    });

    describe('getQuizById', () => {
        it('should return a quiz by ID', async () => {
            const expectedQuiz = mockQuizTable[0];
            mockQuizModel.findById.mockReturnValueOnce(expectedQuiz);
            const result = await service.getQuizById('fakeID');
            expect(result).toEqual(expectedQuiz);
        });

        it('should log an error if there is an exception', async () => {
            mockQuizModel.findById.mockImplementationOnce(() => {
                throw new Error('Mocked error');
            });
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
            await service.getQuizById('fakeID');
            expect(loggerErrorSpy).toHaveBeenCalledWith('Error getting quiz by id: ', expect.any(Error));
        });
    });

    describe('updateQuizById', () => {
        it('should update a quiz by ID', async () => {
            const mockedId = 'fakeID';
            const mockedQuiz: Quiz = mockQuizTable[0];
            const filter = { _id: mockedId };
            await service.updateQuizById(mockedId, mockedQuiz);
            expect(mockQuizModel.replaceOne).toHaveBeenCalledWith(filter, mockedQuiz);
        });

        it('should log an error if there is an exception', async () => {
            const mockedId = 'fakeID';
            const mockedQuiz: Quiz = mockQuizTable[0];
            mockQuizModel.replaceOne.mockImplementationOnce(() => {
                throw new Error('Mocked error');
            });
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
            await service.updateQuizById(mockedId, mockedQuiz);
            expect(loggerErrorSpy).toHaveBeenCalledWith('Error updating quiz: ', expect.any(Error));
        });
    });

    describe('deleteQuizById', () => {
        it('should delete a quiz by ID', async () => {
            const mockedId = 'fakeID';
            await service.deleteQuizById(mockedId);
            expect(mockQuizModel.deleteOne).toHaveBeenCalledWith({ _id: mockedId });
        });

        it('should log an error if there is an exception', async () => {
            const mockedId = 'fakeID';
            mockQuizModel.deleteOne.mockImplementationOnce(() => {
                throw new Error('Mocked error');
            });
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
            await service.deleteQuizById(mockedId);
            expect(loggerErrorSpy).toHaveBeenCalledWith('Error deleting quiz: ', expect.any(Error));
        });
    });

    describe('addNewQuiz', () => {
        it('should add a new quiz', async () => {
            const mockedQuiz: Quiz = mockQuizTable[0];
            await service.addNewQuiz(mockedQuiz);
            expect(mockQuizModel.create).toHaveBeenCalledWith(mockedQuiz);
        });

        it('should log an error if there is an exception', async () => {
            const mockedQuiz: Quiz = mockQuizTable[0];
            mockQuizModel.create.mockImplementationOnce(() => {
                throw new Error('Mocked error');
            });
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
            await service.addNewQuiz(mockedQuiz);
            expect(loggerErrorSpy).toHaveBeenCalledWith('Error adding new quiz: ', expect.any(Error));
        });
    });

    describe('validateQuizObject', () => {
        it('should return true for a valid quiz object', async () => {
            const validQuiz = {
                name: 'Valid Quiz',
                duration: 30,
                description: 'This is a valid quiz description',
                visibility: true,
                questions: [
                    {
                        type: 'multiple_choice',
                        label: 'What is 2 + 2?',
                        points: 20,
                        choices: [
                            { label: '2', isCorrect: false },
                            { label: '3', isCorrect: false },
                            { label: '4', isCorrect: true },
                        ],
                    },
                ],
            };

            const result = await service.validateQuizObject(validQuiz);
            expect(result).toBe(true);
        });

        it('should return false for an invalid entry', async () => {
            const invalidQuiz = {
                name: 'Invalid Quiz',
                duration: 100,
                description: 'This is a descriptionn',
                visibility: true,
                questions: [
                    {
                        type: 'invalid_type',
                        label: 'What is 2 + 2?',
                        points: 20,
                        choices: [
                            { label: '2', isCorrect: false },
                            { label: '3', isCorrect: false },
                            { label: '4', isCorrect: true },
                        ],
                    },
                ],
            };

            const result = await service.validateQuizObject(invalidQuiz);
            expect(result).toBe(false);
        });
    });

    describe('validateQuestionObject', () => {
        it('should return true for a valid question object', async () => {
            const validQuestion = {
                type: 'QCM',
                label: 'What is 2 + 2?',
                points: 20,
                choices: [
                    { label: '2', isCorrect: false },
                    { label: '3', isCorrect: false },
                    { label: '4', isCorrect: true },
                ],
            };

            const result = await service.validateQuestionObject(validQuestion);
            expect(result).toBe(true);
        });

        it('should return false for an invalid question object', async () => {
            const invalidQuestion = {
                type: 'invalid_type',
                label: 'What is 2 + 2?',
                points: 20,
                choices: [
                    { label: '2', isCorrect: false },
                    { label: '3', isCorrect: false },
                    { label: '4', isCorrect: true },
                ],
            };

            const result = await service.validateQuestionObject(invalidQuestion);
            expect(result).toBe(false);
        });
    });
});
