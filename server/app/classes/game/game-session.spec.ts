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
    let duration: number;
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
        duration = 1;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GameSession.constructor', () => {
        it('initializes correctly', () => {
            expect(gameSession.gameState).toBe(GameState.WaitingPlayers);
            expect(gameSession.room).toBe(room);
            expect(gameSession.quiz).toBe(quiz);
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

        it('does not call startGame if type is not GameType.Test', () => {
            gameSession.type = GameType.Random;
            const startGameSpy = jest.spyOn(gameSession, 'startGame');
            gameSession.startGameDelayed();
            expect(startGameSpy).not.toHaveBeenCalled();
        });
    });

    describe('startGame', () => {
        it('starGame should call changeGameState, broadcastGameNextQuestion, startQuestionCooldown', () => {
            const changeGameStateMock = jest.spyOn(gameSession, 'changeGameState');
            const startQuestionCooldownMock = jest.spyOn(gameSession, 'startQuestionCooldown');
            const gameSessionAny = gameSession as any;
            const broadcastGameNextQuestionMock = jest.spyOn(gameSessionAny, 'broadcastGameNextQuestion');

            gameSession.startGame();

            expect(changeGameStateMock).toHaveBeenCalledWith(GameState.PlayersAnswerQuestion);
            expect(broadcastGameNextQuestionMock).toHaveBeenCalled();
            expect(startQuestionCooldownMock).toHaveBeenCalled();
        });
    });

    describe('startQuestionCooldown', () => {
        it('does nothing if gameState is not PlayersAnswerQuestion', () => {
            gameSession.gameState = GameState.WaitingPlayers;
            const simpleDelaySpy = jest.spyOn(gameSession as unknown as { simpleDelay: () => void }, 'simpleDelay');
            gameSession.startQuestionCooldown();
            expect(simpleDelaySpy).not.toHaveBeenCalled();
        });

        it('should start cooldown and call displayQuestionResults if gameState is PlayersAnswerQuestion', () => {
            gameSession.gameState = GameState.PlayersAnswerQuestion;

            const simpleDelaySpy = jest.spyOn(gameSession as any, 'simpleDelay');
            const displayQuestionResultsSpy = jest.spyOn(gameSession, 'displayQuestionResults');

            gameSession.quiz = quiz;
            gameSession.startQuestionCooldown();

            expect(simpleDelaySpy).toHaveBeenCalledWith(quiz.duration, expect.any(Function));

            const callback = simpleDelaySpy.mock.calls[0][1] as () => void;
            callback();

            expect(displayQuestionResultsSpy).toHaveBeenCalled();
        });
    });

    describe('displayQuestionResults', () => {
        it('should call sendScores and changeGameState', () => {
            gameSession.type = GameType.Default;

            const changeGameStateSpy = jest.spyOn(gameSession, 'changeGameState');
            const sendScoresAny = gameSession as any; // because sendScores is private
            const sendScoresSpy = jest.spyOn(sendScoresAny, 'sendScores');
            const nextQuestionSpy = jest.spyOn(gameSession, 'nextQuestion');

            gameSession.displayQuestionResults();

            expect(changeGameStateSpy).toHaveBeenCalledWith(GameState.DisplayQuestionResults);
            expect(sendScoresSpy).toHaveBeenCalled();
            expect(nextQuestionSpy).not.toHaveBeenCalled();
        });

        it('should call sendScores, changeGameState, and nextQuestion for GameType.Test', () => {
            gameSession.type = GameType.Test;

            const changeGameStateSpy = jest.spyOn(gameSession, 'changeGameState');
            const sendScoresAny = gameSession as any;
            const sendScoresSpy = jest.spyOn(sendScoresAny, 'sendScores');
            const nextQuestionSpy = jest.spyOn(gameSession, 'nextQuestion');

            gameSession.displayQuestionResults();

            expect(changeGameStateSpy).toHaveBeenCalledWith(GameState.DisplayQuestionResults);
            expect(sendScoresSpy).toHaveBeenCalled();
            expect(nextQuestionSpy).toHaveBeenCalled();
        });
    });

    describe('nextQuestion', () => {
        it('should do nothing if gameState is not DisplayQuestionResults', () => {
            gameSession.gameState = GameState.WaitingPlayers;

            const changeGameStateSpy = jest.spyOn(gameSession, 'changeGameState');

            const broadcastGameNextQuestionAny = gameSession as any;
            const broadcastGameNextQuestionSpy = jest.spyOn(broadcastGameNextQuestionAny, 'broadcastGameNextQuestion');
            const startQuestionCooldownSpy = jest.spyOn(gameSession, 'startQuestionCooldown');

            gameSession.nextQuestion();

            expect(changeGameStateSpy).not.toHaveBeenCalled();
            expect(broadcastGameNextQuestionSpy).not.toHaveBeenCalled();
            expect(startQuestionCooldownSpy).not.toHaveBeenCalled();
        });

        it('should call displayResults if gameQuestionIndex is equal to the number of questions', () => {
            gameSession.gameState = GameState.DisplayQuestionResults;
            gameSession.gameQuestionIndex = quiz.questions.length;
            const displayResultsSpy = jest.spyOn(gameSession, 'displayResults');

            gameSession.nextQuestion();

            expect(displayResultsSpy).toHaveBeenCalled();
        });

        /* it('should call methods and change game state correctly if gameState is DisplayQuestionResults', () => {
            gameSession.gameState = GameState.DisplayQuestionResults;

            // eslint-disable-next-line @typescript-eslint/no-shadow
            const serverMock = {
                to: jest.fn().mockReturnThis(),
                except: jest.fn().mockReturnThis(),
                emit: jest.fn().mockReturnThis(),
            };

            gameSession.room.server = serverMock as any;

            const changeGameStateSpy = jest.spyOn(gameSession, 'changeGameState');
            const broadcastGameNextQuestionSpy = jest.spyOn(gameSession as any, 'broadcastGameNextQuestion');
            const startQuestionCooldownSpy = jest.spyOn(gameSession, 'startQuestionCooldown');

            gameSession.nextQuestion();

            expect(changeGameStateSpy).toHaveBeenCalledWith(GameState.PlayersAnswerQuestion);
            expect(broadcastGameNextQuestionSpy).toHaveBeenCalled();
            expect(startQuestionCooldownSpy).toHaveBeenCalled();
        });*/
    });

    describe('displayResults', () => {
        it('should call sendResultsToPlayers and changeGameState after delay', () => {
            const changeGameStateSpy = jest.spyOn(gameSession, 'changeGameState');
            const sendResultsToPlayersSpy = jest.spyOn(gameSession, 'sendResultsToPlayers');

            jest.spyOn(gameSession as any, 'simpleDelay').mockImplementation((delay: number, callback: () => void) => {
                callback();
            });

            gameSession.displayResults();

            expect(changeGameStateSpy).toHaveBeenCalledWith(GameState.DisplayQuizResults);
            expect(sendResultsToPlayersSpy).toHaveBeenCalled();
        });

        it('should call simpleDelay with correct parameters', () => {
            const simpleDelaySpy = jest.spyOn(gameSession as any, 'simpleDelay');
            gameSession.displayResults();
            expect(simpleDelaySpy).toHaveBeenCalledWith(NEXT_QUESTION_DELAY, expect.any(Function));
        });
    });
});
