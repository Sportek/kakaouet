import { Quiz } from '@app/model/database/quiz';
import { QuizDto } from '@app/model/dto/quiz/quiz.dto';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { mockQuizTable } from './mock-quiz';
import { QuizService } from './quiz.service';

const mockQuizModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    updateOne: jest.fn(),
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

        it('should log an error if inserting questions fails', async () => {
            mockQuizModel.insertMany.mockImplementationOnce(() => {
                throw new Error('Mocked error');
            });
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
            await service.populateDB();
            expect(loggerErrorSpy).toHaveBeenCalledWith('Error populating db with quizzes: ', expect.any(Error));
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
            const mockedQuiz: QuizDto = mockQuizTable[1];
            const filter = { _id: mockedId };
            await service.updateQuizById(mockedId, mockedQuiz);
            expect(mockQuizModel.updateOne).toHaveBeenCalledWith(filter, mockedQuiz);
        });

        it('should log an error if there is an exception', async () => {
            const mockedId = 'fakeID';
            const mockedQuiz: QuizDto = mockQuizTable[0];
            mockQuizModel.updateOne.mockImplementationOnce(() => {
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
            const mockedQuiz: QuizDto = mockQuizTable[0];
            await service.addNewQuiz(mockedQuiz);
            expect(mockQuizModel.create).toHaveBeenCalledWith(mockedQuiz);
        });

        it('should log an error if there is an exception', async () => {
            const mockedQuiz: QuizDto = mockQuizTable[0];
            mockQuizModel.create.mockImplementationOnce(() => {
                throw new Error('Mocked error');
            });
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
            await service.addNewQuiz(mockedQuiz);
            expect(loggerErrorSpy).toHaveBeenCalledWith('Error adding new quiz: ', expect.any(Error));
        });
    });

    describe('doesQuizExist', () => {
        it('should return true if quiz exists', async () => {
            mockQuizModel.findOne.mockResolvedValue(mockQuizTable[0]);
            const result = await service.doesQuizExist('exampleQuiz');
            expect(result).toBe(true);
        });

        it('should return false if quiz does not exist', async () => {
            mockQuizModel.findOne.mockResolvedValue(null);
            const result = await service.doesQuizExist('nonExistingQuiz');
            expect(result).toBe(false);
        });
    });
});
