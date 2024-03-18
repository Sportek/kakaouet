/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Room } from '@app/classes/room';
import { GameService } from '@app/services/game/game.service';
import { GameType } from '@common/game-types';
import { GameState, QuestionType, Quiz } from '@common/types';
import { Server } from 'socket.io';
import { GameSession } from './game-session';

jest.mock('socket.io', () => {
    const mServer = {
        to: jest.fn().mockReturnThis(),
        except: jest.fn().mockReturnThis(),
        emit: jest.fn().mockReturnThis(),
    };
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return { Server: jest.fn(() => mServer) };
});

describe('GameSession', () => {
    let gameSession: GameSession;
    let room: Room;
    let quiz: Quiz;
    let serverMock: Server;
    // eslint-disable-next-line no-unused-vars
    const START_GAME_DELAY = 5;
    const NEXT_QUESTION_DELAY = 3;

    beforeEach(() => {
        jest.clearAllMocks();
        serverMock = new Server() as unknown as Server;
        // const mockServer = {} as Server;
        const mockGameService = {} as GameService;
        room = new Room('test-room', serverMock, mockGameService);
        quiz = {
            _id: 'quiz123',
            name: 'Test Quiz',
            duration: 60,
            description: 'A quiz for testing',
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
                {
                    _id: 'question2',
                    label: 'Test Question 2',
                    type: QuestionType.QCM,
                    points: 5,
                    choices: [{ _id: 1, label: 'Choice 2', isCorrect: true }],
                    createdAt: new Date(),
                    lastModification: new Date(),
                },
            ],
            createdAt: new Date(),
            lastModification: new Date(),
        };
        gameSession = new GameSession('game123', room, quiz, GameType.Default);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GameSession.constructor', () => {
        it('initializes correctly', () => {
            expect(gameSession.gameState).toBe(GameState.WaitingPlayers);
            expect(gameSession.room).toBe(room);
            expect(gameSession.quiz).toBe(quiz);
            // Verify room.setGame was called with 'gameSession'
        });
    });

    describe('startGameDelayed', () => {
        it('does nothing if gameState is not WaitingPlayers', () => {
            gameSession.gameState = GameState.PlayersAnswerQuestion;
            const simpleDelaySpy = jest.spyOn(gameSession as any, 'simpleDelay');
            gameSession.startGameDelayed();
            expect(simpleDelaySpy).not.toHaveBeenCalled();
        });

        it('calls startGame if type is GameType.Test', () => {
            gameSession.type = GameType.Test;
            const startGameSpy = jest.spyOn(gameSession, 'startGame');
            gameSession.startGameDelayed();
            expect(startGameSpy).toHaveBeenCalled();
        });

        /* it('calls simpleDelay and then startGame if gameState is WaitingPlayers and type is not GameType.Test', () => {
            gameSession.gameState = GameState.WaitingPlayers;
            gameSession.type = GameType.Default;

            const simpleDelaySpy = jest.spyOn(gameSession as any, 'simpleDelay');

            gameSession.startGameDelayed();

            expect(simpleDelaySpy).toHaveBeenCalledWith(START_GAME_DELAY, expect.any(Function));

            // Manually trigger the callback function passed to simpleDelay
            const callback = simpleDelaySpy.mock.calls[0][1];
            callback();

            expect(gameSession.startGame).toHaveBeenCalled();
        });*/
    });

    describe('startQuestionCooldown', () => {
        it('does nothing if gameState is not PlayersAnswerQuestion', () => {
            gameSession.gameState = GameState.WaitingPlayers; // Set to a different state
            const simpleDelaySpy = jest.spyOn(gameSession as unknown as { simpleDelay: () => void }, 'simpleDelay');
            gameSession.startQuestionCooldown();
            expect(simpleDelaySpy).not.toHaveBeenCalled();
        });
    });

    describe('displayQuestionResults', () => {
        it('does nothing if gameState is not DisplayQuestionResults', () => {
            gameSession.gameState = GameState.WaitingPlayers;
            const changeGameStateMock = jest.fn();
            jest.spyOn(gameSession, 'changeGameState').mockImplementation(changeGameStateMock);

            gameSession.nextQuestion();

            expect(changeGameStateMock).not.toHaveBeenCalled();
        });
    });
});

/*            gameSession.type = GameType.Test;
            // const simpleDelaySpy = jest.spyOn(gameSession as any, 'simpleDelay');
            const startGameSpy = jest.spyOn(gameSession, 'startGame');
            gameSession.startGameDelayed();
            // expect(simpleDelaySpy).not.toHaveBeenCalled();
            expect(startGameSpy).toHaveBeenCalled();*/
