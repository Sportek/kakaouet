import { Question } from '@app/model/database/question';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { mockQuestions } from './mock-question';
import { QuestionService } from './question.service';

const mockQuestionModel = {
    find: jest.fn(),
    findById: jest.fn(),
    replaceOne: jest.fn(),
    deleteOne: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
    insertMany: jest.fn(),
    deleteMany: jest.fn(),
};

describe('QuestionService', () => {
    let service: QuestionService;
    let mockData: Question[];

    beforeAll(() => {
        mockData = mockQuestions;
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuestionService,
                Logger,
                {
                    provide: getModelToken(Question.name),
                    useValue: mockQuestionModel,
                },
            ],
        }).compile();

        service = module.get<QuestionService>(QuestionService);
    });

    describe('start', () => {
        it('should populate the database if no questions exist', async () => {
            mockQuestionModel.countDocuments.mockReturnValueOnce(0);
            const populateDBSpy = jest.spyOn(service, 'populateDB');
            await service.start();
            expect(populateDBSpy).toHaveBeenCalled();
        });

        it('should not populate the database if questions already exist', async () => {
            mockQuestionModel.countDocuments.mockReturnValueOnce(1);
            const populateDBSpy = jest.spyOn(service, 'populateDB');
            await service.start();
            expect(populateDBSpy).not.toHaveBeenCalled();
        });
    });

    describe('populateDB', () => {
        it('should log success message on successful population', async () => {
            const spyOnInsertMany = jest.spyOn(mockQuestionModel, 'insertMany');
            await service.populateDB();
            expect(spyOnInsertMany).toHaveBeenCalledWith(mockQuestions);
        });
    });

    describe('getAllQuestions', () => {
        it('should return an array of questions', async () => {
            mockQuestionModel.find.mockReturnValueOnce(mockData);
            const result = await service.getAllQuestions();
            expect(result).toEqual(mockData);
        });

        it('should log an error if there is an exception', async () => {
            mockQuestionModel.find.mockImplementationOnce(() => {
                throw new Error('Mocked error');
            });
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
            await service.getAllQuestions();
            expect(loggerErrorSpy).toHaveBeenCalledWith('Error getting all questions: ', expect.any(Error));
        });
    });

    describe('getQuestionById', () => {
        it('should return a question by ID', async () => {
            const expectedQuestion = mockQuestions[0];
            mockQuestionModel.findById.mockReturnValueOnce(expectedQuestion);
            const result = await service.getQuestionById('fakeID');
            expect(result).toEqual(expectedQuestion);
        });

        it('should log an error if there is an exception', async () => {
            mockQuestionModel.findById.mockImplementationOnce(() => {
                throw new Error('Mocked error');
            });
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
            await service.getQuestionById('fakeID');
            expect(loggerErrorSpy).toHaveBeenCalledWith('Error getting question by id: ', expect.any(Error));
        });
    });

    describe('updateQuestionById', () => {
        it('should update a question by ID', async () => {
            const mockedId = 'fakeID';
            const mockedQuestion: Question = mockQuestions[0];
            const filter = { _id: mockedId };
            await service.updateQuestionById(mockedId, mockedQuestion);
            expect(mockQuestionModel.replaceOne).toHaveBeenCalledWith(filter, mockedQuestion);
        });

        it('should log an error if there is an exception', async () => {
            const mockedId = 'fakeID';
            const mockedQuestion: Question = mockQuestions[0];
            mockQuestionModel.replaceOne.mockImplementationOnce(() => {
                throw new Error('Mocked error');
            });
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
            await service.updateQuestionById(mockedId, mockedQuestion);
            expect(loggerErrorSpy).toHaveBeenCalledWith('Error updating question: ', expect.any(Error));
        });
    });

    describe('deleteQuestionById', () => {
        it('should delete a question by ID', async () => {
            const mockedId = 'fakeID';
            await service.deleteQuestionById(mockedId);
            expect(mockQuestionModel.deleteOne).toHaveBeenCalledWith({ _id: mockedId });
        });

        it('should log an error if there is an exception', async () => {
            const mockedId = 'fakeID';
            mockQuestionModel.deleteOne.mockImplementationOnce(() => {
                throw new Error('Mocked error');
            });
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
            await service.deleteQuestionById(mockedId);
            expect(loggerErrorSpy).toHaveBeenCalledWith('Error deleting question: ', expect.any(Error));
        });
    });

    describe('deleteAllQuestions', () => {
        it('should delete all questions from the database', async () => {
            await service.deleteAllQuestions();
            expect(mockQuestionModel.deleteMany).toHaveBeenCalled();
        });

        it('should log an error if there is an exception', async () => {
            mockQuestionModel.deleteMany.mockImplementationOnce(() => {
                throw new Error('Mocked error');
            });
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
            await service.deleteAllQuestions();
            expect(loggerErrorSpy).toHaveBeenCalledWith('Error deleting questions: ', expect.any(Error));
        });
    });

    describe('addNewQuestion', () => {
        it('should add a new question', async () => {
            const mockedQuestion: Question = mockQuestions[0];
            await service.addNewQuestion(mockedQuestion);
            expect(mockQuestionModel.create).toHaveBeenCalledWith(mockedQuestion);
        });

        it('should log an error if there is an exception', async () => {
            const mockedQuestion: Question = mockQuestions[0];
            mockQuestionModel.create.mockImplementationOnce(() => {
                throw new Error('Mocked error');
            });
            const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
            await service.addNewQuestion(mockedQuestion);
            expect(loggerErrorSpy).toHaveBeenCalledWith('Error adding new question: ', expect.any(Error));
        });
    });

    describe('validateQuestionObject function', () => {
        
        it('should return true for a valid question', async () => {
          const validQuestion = {
            type: 'QCM',
            text: 'What is the capital of France?',
            points: 10,
            choices: [
              { text: 'Paris', isCorrect: true },
              { text: 'Berlin', isCorrect: false },
            ],
          };
      
          const result = await service.validateQuestionObject(validQuestion);
          expect(result).toBe(true);
        });
      
        it('should return false for an invalid question with missing properties', async () => {
          const invalidQuestion = {
            type: 'QCM',
            text: 'What is the capital of France?'
          };
      
          const result = await service.validateQuestionObject(invalidQuestion);
          expect(result).toBe(false);
        });
      
        it('should return false for an invalid entry', async () => {
          const invalidQuestion = {
            type: 'QCM',
            text: 'What is the capital of France?',
            points: 110,
            choices: [
              { text: 'Paris', isCorrect: true },
              { text: 'Berlin', isCorrect: false },
            ],
          };
      
          const result = await service.validateQuestionObject(invalidQuestion);
          expect(result).toBe(false);
        });
      });
});
