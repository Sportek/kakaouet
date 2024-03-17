import { Game } from '@app/model/database/game'; // Update path as necessary
import { Quiz } from '@app/model/database/quiz'; // Update path as necessary
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { mockGame } from './mock-game'; // Update with your actual mock games

// Mock implementations for your models
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
    // Add other methods as necessary
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
            // Mock data to represent the games stored in the database
            const mockGames = [
                { id: 'game1', name: 'Game One' }, // Example game objects
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
            // Since the method catches the error and logs it, it does not throw, and the result would be undefined
            expect(result).toBeUndefined();
        });
    });
    
    describe('getGameByCode', () => {
        it('should return a game when found by code', async () => {
            const mockGame = { id: 'game1', name: 'Test Game' };
            mockGameModel.findById.mockResolvedValue(mockGame);
    
            const result = await service.getGameByCode('game1');
    
            expect(mockGameModel.findById).toHaveBeenCalledWith('game1');
            expect(result).toEqual(mockGame);
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
            // Setup: Assume deleteOne will be successful
            mockGameModel.deleteOne.mockResolvedValue({ acknowledged: true, deletedCount: 1 });
    
            await service.deleteGameByCode(mockCode);
    
            // Verify that deleteOne was called with the correct filter
            expect(mockGameModel.deleteOne).toHaveBeenCalledWith({ _id: mockCode });
        });
    
        it('should log an error if there is an exception during deletion', async () => {
            const mockError = new Error('Deletion failed');
            // Setup: Simulate deleteOne throwing an exception
            mockGameModel.deleteOne.mockRejectedValue(mockError);
    
            const loggerSpy = jest.spyOn(service['logger'], 'error');
    
            await service.deleteGameByCode(mockCode);
    
            // Verify that the error was logged correctly
            expect(loggerSpy).toHaveBeenCalledWith('Error deleting game: ', mockError);
        });
    });
    
    // Assuming GameSession is your class, you might want to mock it similarly
class MockGameSession {
    constructor(public code: string) {}
    // Add other properties and methods as needed for your tests
}

describe('getGameSessionByCode', () => {
    beforeEach(() => {
        // Clear and set up gameSessions map before each test
        service.gameSessions.clear();
    });

    it('should return the correct GameSession when the code exists', () => {
        const mockCode = 'validCode';
        const expectedSession = new MockGameSession(mockCode);
        service.gameSessions.set(mockCode, expectedSession);

        const result = service.getGameSessionByCode(mockCode);

        expect(result).toEqual(expectedSession);
    });

    it('should return undefined when the code does not exist', () => {
        const nonExistentCode = 'nonExistentCode';
        const result = service.getGameSessionByCode(nonExistentCode);

        expect(result).toBeUndefined();
    });
});

});
