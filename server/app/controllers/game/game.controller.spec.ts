/* eslint-disable no-underscore-dangle */
import { GameService } from '@app/services/game/game.service';
import { AnswerState, Game, GameRole, GameType, QuestionType } from '@common/types';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';

const mockGame: Game = {
    _id: '1',
    users: [
        {
            _id: 'user1',
            name: 'Player One',
            score: 10,
            isExcluded: false,
            isActive: true,
            answerState: AnswerState.Waiting,
            role: GameRole.Player,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ],
    quiz: {
        _id: 'quiz1',
        name: 'Test Quiz',
        description: 'A quiz for testing',
        duration: 30,
        visibility: true,
        questions: [
            {
                _id: 'question1',
                label: 'Test Question',
                type: QuestionType.QCM,
                points: 5,
                choices: [{ _id: 1, label: 'Choice 1', isCorrect: true }],
                createdAt: new Date(),
                lastModification: new Date(),
            },
        ],
        createdAt: new Date(),
        lastModification: new Date(),
    },
    type: GameType.Default,
    isLocked: false,
    code: 'testCode',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
};

describe('GameController Tests', () => {
    let gameController: GameController;
    let gameService: GameService;

    beforeEach(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: GameService,
                    useValue: {
                        getAllGames: jest.fn().mockResolvedValue([mockGame]),
                        getGameByCode: jest.fn().mockResolvedValue(mockGame),
                        createNewGame: jest.fn().mockResolvedValue(mockGame),
                        updateGameByCode: jest.fn().mockResolvedValue(mockGame),
                        deleteGameByCode: jest.fn().mockResolvedValue(undefined),
                    },
                },
            ],
        }).compile();

        gameController = moduleRef.get<GameController>(GameController);
        gameService = moduleRef.get<GameService>(GameService);
    });

    it('should be defined', () => {
        expect(gameController).toBeDefined();
    });

    describe('getAllGames', () => {
        it('should return an array of games', async () => {
            await expect(gameController.getAllGames()).resolves.toEqual([mockGame]);
            expect(gameService.getAllGames).toHaveBeenCalled();
        });
    });

    describe('getGameById', () => {
        it('should return a game if it exists', async () => {
            await expect(gameController.getGameById('1')).resolves.toEqual(mockGame);
            expect(gameService.getGameByCode).toHaveBeenCalledWith('1');
        });

        it('should throw NotFoundException if the game does not exist', async () => {
            jest.spyOn(gameService, 'getGameByCode').mockResolvedValueOnce(null);
            await expect(gameController.getGameById('nonexistent')).rejects.toThrow(HttpException);
        });
    });

    describe('createGame', () => {
        it('should create a new game', async () => {
            const newGameData = { quizId: '123', type: GameType.Default };
            await expect(gameController.createGame(newGameData)).resolves.toEqual(mockGame);
            expect(gameService.createNewGame).toHaveBeenCalledWith(newGameData.quizId, newGameData.type);
        });
    });

    describe('deleteGame', () => {
        it('should delete a game', async () => {
            await expect(gameController.deleteGame('1')).resolves.toBeUndefined();
            expect(gameService.deleteGameByCode).toHaveBeenCalledWith('1');
        });
    });
});
