import { GameSession } from '@app/classes/game/game-session';
import { Game } from '@app/model/database/game';
import { Quiz } from '@app/model/database/quiz';
import { HistoryService } from '@app/services/history/history.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { GameState, GameType } from '@common/types';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Server } from 'socket.io';
import { GameService } from './game.service';
import { mockGame } from './mock-game';

const mockHistoryService = {
    createGameHistory: jest.fn(),
    deleteGameHistory: jest.fn(),
    getGameHistory: jest.fn(),
};

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

const mockQuizService = {
    getAllQuizzes: jest.fn(),
    getQuizById: jest.fn(),
    updateQuizById: jest.fn(),
    deleteQuizById: jest.fn(),
    addNewQuiz: jest.fn(),
    doesQuizExist: jest.fn(),
    validateAnswers: jest.fn(),
    generateRandomQuiz: jest.fn(),
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
                {
                    provide: QuizService,
                    useValue: mockQuizService,
                },
                Logger,
                {
                    provide: getModelToken(Game.name),
                    useValue: mockGameModel,
                },
                {
                    provide: getModelToken(Quiz.name),
                    useValue: mockQuizModel,
                },

                {
                    provide: HistoryService,
                    useValue: mockHistoryService,
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

    describe('getGameSessionByCode', () => {
        it('should return undefined for an unknown code', () => {
            const result = service.getGameSessionByCode('unknownCode');
            expect(result).toBeUndefined();
        });
    });

    describe('getGameSessionByCode', () => {
        const game: Game = {
            users: [],
            updatedAt: new Date(),
            createdAt: new Date(),
            quiz: {
                title: 'd',
                duration: 90,
                description: 'dd',
                visibility: true,
                questions: [],
            },
            type: GameType.Default,
            isLocked: true,
            code: '9999',
            messages: [],
        };

        it('should return undefined for an unknown code', () => {
            const result = service.updateGameByCode('ooo', game);
            expect(result).toBeInstanceOf(Object);
        });
    });

    describe('getGameSessionBySocketId', () => {
        const mockSocketId = 'socket123';

        it('should return the correct GameSession for a known socket ID', () => {
            const result = service.getGameSessionBySocketId(mockSocketId);

            expect(result).toBeUndefined();
        });

        it('should return undefined for an unknown socket ID', () => {
            const unknownSocketId = 'unknownSocket123';
            const result = service.getGameSessionBySocketId(unknownSocketId);

            expect(result).toBeUndefined();
        });
    });

     describe('createNewGame', () => {
        const mockQuizId = 'quiz123';
        let mockGameType = GameType.Default;

        it('should successfully create a new game and save it to the database', async () => {
            const result = await service.createNewGame(mockQuizId, mockGameType);

            expect(result).toBeUndefined();
        }); 

        mockGameType = GameType.Random;

        it('should successfully generate a random game and save it to the database', async () => {
            const result = await service.createNewGame(mockQuizId, mockGameType);

            expect(result).toBeUndefined();
        }); 

        it('should log an error if there is a failure during game creation', async () => {
            
            const mockError = new Error('Failed to create game');
            mockQuizModel.findById.mockRejectedValue(mockError);
            const loggerSpy = jest.spyOn(service['logger'], 'error');

            const result = await service.createNewGame(mockQuizId, mockGameType);

            expect(loggerSpy).not.toHaveBeenCalled();
        });
    }); 

    describe('getGameSessionBySocketId', () => {
        it('should return the correct GameSession for a known socket ID', () => {
            const gameSessionMap = new Map<string, GameSession>();
            const gameSession = {
                code: '1234',
                room: {
                    getPlayers: jest.fn().mockReturnValue([{ socket: { id: 'socket123' } }]),
                },
                timer: undefined,
                gameState: GameState.DisplayQuestionResults,
                type: GameType.Default,
                gameQuestionIndex: 1,
                isLocked: true,
            };
            gameSessionMap.set('1234', gameSession as unknown as GameSession);
            // @ts-ignore
            service.gameSessions = gameSessionMap;
            const result = service.getGameSessionBySocketId('socket123');
            expect(result).toEqual(gameSession);
        });
    });

    it('should remove gameSession', () => {
        const gameSessionMap = new Map<string, GameSession>();
        const gameSession = {
            code: '1234',
            room: {
                getPlayers: jest.fn().mockReturnValue([{ socket: { id: 'socket123' } }]),
            },
            timer: undefined,
            gameState: GameState.DisplayQuestionResults,
            type: GameType.Default,
            gameQuestionIndex: 1,
            isLocked: true,
        };
        gameSessionMap.set('1234', gameSession as unknown as GameSession);
        // @ts-ignore
        service.gameSessions = gameSessionMap;
        service.removeGameSession('1234');
        // @ts-ignore
        expect(service.gameSessions.size).toEqual(0);
    });

    it('should create a game session', async () => {
        const code = 'testCode';
        const quizId = 'quiz123';
        const gameType = GameType.Default;

        const mockServer = {} as unknown as Server;
        const mockQuiz = {
            id: quizId,
            toObject: jest.fn().mockReturnValue({}),
        };
        mockQuizModel.findById.mockReturnValue(mockQuiz);

        const result = await service.createGameSession(code, mockServer, quizId, gameType);

        expect(result).toBeInstanceOf(GameSession);
        expect(result.code).toEqual(code);
        expect(mockQuizModel.findById).toHaveBeenCalledWith(quizId);
    });

    it('should create a game session', async () => {
        const code = 'testCode';
        const quizId = 'quiz123';
        const gameType = GameType.Random;

        const mockServer = {} as unknown as Server;
        const mockQuiz = {
            id: quizId,
            toObject: jest.fn().mockReturnValue({}),
        };
        mockQuizModel.findById.mockReturnValue(mockQuiz);

        const result = await service.createGameSession(code, mockServer, quizId, gameType);

        expect(result).toBeInstanceOf(GameSession);
        expect(result.code).toEqual(code);
        expect(mockQuizModel.findById).toHaveBeenCalledWith(quizId);
    });

    it("shouldn't update game", async () => {
        const testCode = 'testCode';
        const testGame = { _id: testCode, name: 'Test Game', updatedAt: new Date() };
        mockGameModel.replaceOne.mockRejectedValue(new Error('Test error'));
        service.updateGameByCode(testCode, testGame as unknown as Game);
        expect(mockGameModel.findOne).toHaveBeenCalled();
    });
});
