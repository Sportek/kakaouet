import { Game } from '@app/model/database/game';
import { Quiz } from '@app/model/database/quiz';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { mockGame } from './mock-game';

const mockGameModel = {
    find: jest.fn(),
    findById: jest.fn(),
    replaceOne: jest.fn(),
    deleteOne: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
    insertMany: jest.fn(),
    findOne: jest.fn(),
};

const mockQuizModel = {
    findById: jest.fn(),
};

describe('GameService', () => {
    let service: GameService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameService,
                Logger,
                {
                    provide: getModelToken(Game.name),
                    useValue: mockGameModel,
                },
                {
                    provide: getModelToken(Quiz.name),
                    useValue: mockQuizModel,
                },
            ],
        }).compile();

        service = module.get<GameService>(GameService);
    });

    describe('populateDB', () => {
        it('should populate the database with initial games if empty', async () => {
            mockGameModel.countDocuments.mockResolvedValue(0);
            await service.populateDB();
            expect(mockGameModel.insertMany).toHaveBeenCalledWith(mockGame);
        });

        it('should log an error if populating the database fails', async () => {
            const mockError = new Error('InsertManyFailed');
            mockGameModel.insertMany.mockRejectedValue(mockError);
            const loggerSpy = jest.spyOn(service['logger'], 'error');
            await service.populateDB();
            expect(loggerSpy).toHaveBeenCalledWith('Error populating db with games: ', mockError);
        });
    });

    describe('getAllGames', () => {
        it('should return an array of all games', async () => {
            const mockGames = [
                { id: 'game1', name: 'Game One' },
                { id: 'game2', name: 'Game Two' },
            ];
            mockGameModel.find.mockResolvedValue(mockGames);

            const result = await service.getAllGames();

            expect(mockGameModel.find).toHaveBeenCalledWith({});
            expect(result).toEqual(mockGames);
        });

        it('should log an error if there is an exception', async () => {
            const mockError = new Error('Mocked error');
            mockGameModel.find.mockRejectedValue(mockError);
            const loggerSpy = jest.spyOn(service['logger'], 'error');

            const result = await service.getAllGames();

            expect(loggerSpy).toHaveBeenCalledWith('Error getting all games: ', mockError);
            expect(result).toBeUndefined();
        });
    });

    describe('getGameByCode', () => {
        it('should return a game when found by code', async () => {
            const mockGameS = { id: 'game1', name: 'Test Game' };
            mockGameModel.findById.mockResolvedValue(mockGameS);

            const result = await service.getGameByCode('game1');

            expect(mockGameModel.findById).toHaveBeenCalledWith('game1');
            expect(result).toEqual(mockGameS);
        });

        it('should log an error if there is an exception', async () => {
            const mockError = new Error('Mocked error');
            mockGameModel.findById.mockRejectedValue(mockError);
            const loggerSpy = jest.spyOn(service['logger'], 'error');

            const result = await service.getGameByCode('invalidCode');

            expect(loggerSpy).toHaveBeenCalledWith('Error getting game by id: ', mockError);
            expect(result).toBeUndefined();
        });
    });

    describe('deleteGameByCode', () => {
        const mockCode = 'game123';

        it('should successfully delete a game by code', async () => {
            mockGameModel.deleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 });

            await service.deleteGameByCode(mockCode);

            expect(mockGameModel.deleteOne).toHaveBeenCalledWith({ _id: mockCode });
        });

        it('should log an error if there is an exception during deletion', async () => {
            const mockError = new Error('Deletion failed');
            mockGameModel.deleteOne.mockRejectedValue(mockError);

            const loggerSpy = jest.spyOn(service['logger'], 'error');

            await service.deleteGameByCode(mockCode);

            expect(loggerSpy).toHaveBeenCalledWith('Error deleting game: ', mockError);
        });
    });
});
