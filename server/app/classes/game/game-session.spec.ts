/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-lines */
/* eslint-disable no-restricted-imports */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Player } from '@app/classes/player/player';
import { Room } from '@app/classes/room/room';
import { GameService } from '@app/services/game/game.service';
import { HistoryService } from '@app/services/history/history.service';
import { CompletePlayerAnswer, GameEvents, GameType } from '@common/game-types';
import { GameRole, GameState, Question, QuestionType, Quiz } from '@common/types';
import { Server } from 'socket.io';
import { Timer } from '../timer';
import { GameSession } from './game-session';

describe('GameSession', () => {
    let gameSession: GameSession;
    let room: Room;
    let quiz: Quiz;
    let serverMock: Server;
    let duration: number;
    let timerMock: Timer;
    let historyService: HistoryService;
    // eslint-disable-next-line no-unused-vars
    const START_GAME_DELAY = 5;
    const NEXT_QUESTION_DELAY = 3;

    const mockPlayer: Partial<Player> = {
        name: 'Player 1',
        role: GameRole.Player,
        socket: {} as any,
        bonus: 0,
        score: 0,
        isExcluded: false,
        hasGiveUp: false,
        setRoom: jest.fn(),
        confirmAnswer: jest.fn(),
        setAnswer: jest.fn(),
        getAnswer: jest.fn(),
        send: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        joinRoom: jest.fn(),
        leaveRoom: jest.fn(),
        leaveAllRooms: jest.fn(),
    };

    const mockRoom = {
        code: 'test-room',
        players: [],
        game: {},
        gameService: {},
        broadcast: jest.fn(),
        setGame: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        timerMock = {
            togglePlayPause: jest.fn(),
            speedUp: jest.fn(),
        } as any;
        serverMock = new Server() as unknown as Server;
        const mockGameService = {} as GameService;
        const historyServiceMock = {
            createNewHistory: jest.fn().mockResolvedValue(Promise.resolve()),
        } as unknown as HistoryService;

        room = new Room('test-room', serverMock, mockGameService);
        quiz = {
            _id: 'quiz123',
            title: 'Test Quiz',
            duration: 60,
            description: 'A quiz for testing',
            visibility: true,
            questions: [
                {
                    _id: 'question1',
                    text: 'Test Question',
                    type: QuestionType.QCM,
                    points: 5,
                    choices: [{ _id: 1, text: 'Choice 1', isCorrect: true }],
                    createdAt: new Date(),
                    lastModification: new Date(),
                },
                {
                    _id: 'question2',
                    text: 'Test Question 2',
                    type: QuestionType.QCM,
                    points: 5,
                    choices: [{ _id: 1, text: 'Choice 2', isCorrect: true }],
                    createdAt: new Date(),
                    lastModification: new Date(),
                },
            ],
            createdAt: new Date(),
            lastModification: new Date(),
        };
        gameSession = new GameSession('game123', room, quiz, GameType.Default, historyServiceMock);
        duration = 1;
        gameSession.timer = timerMock;
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

        it('should change game state and callchangeGameState, broadcastGameNextQuestion and startQuestionCooldown', () => {});
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

    describe('sendResultsToPlayers', () => {
        it('should not send results if gameState is not DisplayQuizResults', () => {
            gameSession.gameState = GameState.WaitingPlayers;

            const sortPlayersByScoreAny = gameSession as any;
            const sortPlayersByScoreSpy = jest.spyOn(sortPlayersByScoreAny, 'sortPlayersByScore');
            const broadcastPlayerResultsAny = gameSession as any;
            const broadcastPlayerResultsSpy = jest.spyOn(broadcastPlayerResultsAny, 'broadcastPlayerResults');
            const calculateCorrectChoicesAny = gameSession as any;
            const calculateCorrectChoicesSpy = jest.spyOn(calculateCorrectChoicesAny, 'calculateCorrectChoices');

            gameSession.sendResultsToPlayers();

            expect(sortPlayersByScoreSpy).not.toHaveBeenCalled();
            expect(broadcastPlayerResultsSpy).not.toHaveBeenCalled();
            expect(calculateCorrectChoicesSpy).not.toHaveBeenCalled();
        });

        it('should send results if gameState is DisplayQuizResults', () => {
            gameSession.gameState = GameState.DisplayQuizResults;
            const sortedPlayers = [
                { name: 'Player 1', score: 10, bonus: 5 },
                { name: 'Player 2', score: 15, bonus: 10 },
            ];

            const getOnlyGamePlayersMock = jest.fn(() => sortedPlayers as Player[]);
            jest.spyOn(gameSession.room, 'getOnlyGamePlayers').mockImplementation(getOnlyGamePlayersMock);

            const sortPlayersByScoreMock = jest.fn(() => sortedPlayers);
            const sortPlayersByScoreAny = gameSession as any;
            jest.spyOn(sortPlayersByScoreAny, 'sortPlayersByScore').mockImplementation(sortPlayersByScoreMock);

            const broadcastPlayerResultsAny = gameSession as any;
            const broadcastPlayerResultsSpy = jest.spyOn(broadcastPlayerResultsAny, 'broadcastPlayerResults');
            const calculateCorrectChoicesMock = jest.fn(() => []);

            const calculateCorrectChoicesAny = gameSession as any;
            jest.spyOn(calculateCorrectChoicesAny, 'calculateCorrectChoices').mockImplementation(calculateCorrectChoicesMock);

            gameSession.sendResultsToPlayers();

            expect(sortPlayersByScoreMock).toHaveBeenCalled();
            expect(broadcastPlayerResultsSpy).toHaveBeenCalledWith(
                [
                    { name: 'Player 1', score: 10, bonus: 5 },
                    { name: 'Player 2', score: 15, bonus: 10 },
                ],
                [],
            );
            expect(calculateCorrectChoicesMock).toHaveBeenCalled();
        });
    });

    describe('endGame', () => {
        it('should change game state to End', () => {
            gameSession.gameState = GameState.PlayersAnswerQuestion;
            const changeGameStateSpy = jest.spyOn(gameSession, 'changeGameState');
            gameSession.endGame();
            expect(changeGameStateSpy).toHaveBeenCalledWith(GameState.End);
        });
    });

    describe('changeGameState', () => {
        it('should change the game state and broadcast the event', () => {
            const newState = GameState.PlayersAnswerQuestion;
            // eslint-disable-next-line @typescript-eslint/no-shadow
            const gameSession = new GameSession('game123', mockRoom as unknown as Room, quiz, GameType.Default, historyService);

            gameSession.changeGameState(newState);

            expect(gameSession.gameState).toBe(newState);
            expect(mockRoom.broadcast).toHaveBeenCalledWith(GameEvents.GameStateChanged, {}, { gameState: newState });
        });
    });

    describe('changeGameLockState', () => {
        it('should change the game lock state and broadcast the event', () => {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            const gameSession = new GameSession('game123', mockRoom as unknown as Room, quiz, GameType.Default, historyService);
            gameSession.changeGameLockState();

            expect(gameSession.isLocked).toBe(true);
            expect(mockRoom.broadcast).toHaveBeenCalledWith(GameEvents.GameLockedStateChanged, {}, { isLocked: true });
        });
    });

    describe('broadcastMessage', () => {
        it('should broadcast a message to players', () => {
            const messageContent = 'Hello players!';

            // eslint-disable-next-line @typescript-eslint/no-shadow
            const gameSession = new GameSession('game123', mockRoom as unknown as Room, quiz, GameType.Default, historyService);

            gameSession.broadcastMessage(messageContent, mockPlayer as Player);

            expect(mockRoom.broadcast).toHaveBeenCalledWith(
                GameEvents.PlayerSendMessage,
                {},
                expect.objectContaining({
                    name: mockPlayer.name,
                    content: messageContent,
                    createdAt: expect.any(Date),
                }),
            );
        });
    });

    describe('toggleTimer', () => {
        it('should toggle the timer play/pause if timer exists', () => {
            gameSession.toggleTimer();
            expect(timerMock.togglePlayPause).toHaveBeenCalled();
        });

        it('should not do anything if timer does not exist', () => {
            gameSession.timer = null;
            gameSession.toggleTimer();
            expect(timerMock.togglePlayPause).not.toHaveBeenCalled();
        });
    });

    describe('speedUpTimer', () => {
        it('should speed up the timer if timer exists', () => {
            gameSession.speedUpTimer();
            expect(timerMock.speedUp).toHaveBeenCalled();
        });

        it('should not do anything if timer does not exist', () => {
            gameSession.timer = null;
            gameSession.speedUpTimer();
            expect(timerMock.speedUp).not.toHaveBeenCalled();
        });
    });

    describe('broadcastCorrectAnswers', () => {
        it('should not broadcast correct answers for a non-QCM question', () => {
            const mockQuestion: Question = {
                _id: '123',
                text: 'What is the capital of France?',
                points: 10,
                createdAt: new Date(),
                lastModification: new Date(),
                type: QuestionType.QRL,
            };

            // eslint-disable-next-line @typescript-eslint/no-shadow
            const gameSession = new GameSession('game123', mockRoom as unknown as Room, quiz, GameType.Default, historyService);
            gameSession['broadcastCorrectAnswers'](mockQuestion);

            expect(mockRoom.broadcast).not.toHaveBeenCalled();
        });

        it('should broadcast correct answers for a QCM question', () => {
            const mockQuestion: Question = {
                _id: '123',
                text: 'What is the capital of France?',
                points: 10,
                createdAt: new Date(),
                lastModification: new Date(),
                type: QuestionType.QCM,
                choices: [
                    { _id: 1, text: 'Paris', isCorrect: true },
                    { _id: 2, text: 'London', isCorrect: false },
                    { _id: 3, text: 'Berlin', isCorrect: false },
                    { _id: 4, text: 'Rome', isCorrect: true },
                ],
            };

            // eslint-disable-next-line @typescript-eslint/no-shadow
            const gameSession = new GameSession('game123', mockRoom as unknown as Room, quiz, GameType.Default, historyService);

            gameSession['broadcastCorrectAnswers'](mockQuestion);

            expect(mockRoom.broadcast).toHaveBeenCalledWith(
                GameEvents.SendCorrectAnswers,
                {},
                {
                    choices: [
                        { _id: 1, text: 'Paris', isCorrect: true },
                        { _id: 4, text: 'Rome', isCorrect: true },
                    ],
                },
            );
        });
    });
    describe('sortPlayersAnswersByTime', () => {
        const mockAnswer1: CompletePlayerAnswer = {
            hasInterracted: true,
            hasConfirmed: true,
            hasConfirmedAt: new Date('2024-03-25T12:00:00Z'),
            answer: 'Answer',
        };

        const mockAnswer2: CompletePlayerAnswer = {
            hasInterracted: true,
            hasConfirmed: true,
            hasConfirmedAt: new Date('2023-03-25T12:00:00Z'),
            answer: 'Answer',
        };

        const mockPlayer1: Player = {
            name: 'Player1',
            role: GameRole.Player,
            socket: {} as any,
            bonus: 0,
            score: 10,
            isExcluded: false,
            hasGiveUp: false,
            // @ts-ignore
            room: mockRoom,
            // @ts-ignore
            game: gameSession,
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/naming-convention
            answers: { 1: { mockAnswer1 } },
            setRoom: jest.fn(),
            confirmAnswer: jest.fn(),
            setAnswer: jest.fn(),
            getAnswer: jest.fn(),
            send: jest.fn(),
            on: jest.fn(),
            off: jest.fn(),
            joinRoom: jest.fn(),
            leaveRoom: jest.fn(),
            leaveAllRooms: jest.fn(),
        };

        const mockPlayer2: Player = {
            name: 'Player2',
            role: GameRole.Player,
            socket: {} as any,
            bonus: 0,
            score: 10,
            isExcluded: false,
            hasGiveUp: false,
            // @ts-ignore
            room: mockRoom,
            // @ts-ignore
            game: gameSession,
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/naming-convention
            answers: { 1: { mockAnswer2 } },
            setRoom: jest.fn(),
            confirmAnswer: jest.fn(),
            setAnswer: jest.fn(),
            getAnswer: jest.fn(),
            send: jest.fn(),
            on: jest.fn(),
            off: jest.fn(),
            joinRoom: jest.fn(),
            leaveRoom: jest.fn(),
            leaveAllRooms: jest.fn(),
        };

        it('should sort the players by time', () => {
            const players: Player[] = [mockPlayer1, mockPlayer2];
            gameSession.gameQuestionIndex = 1;
            // @ts-ignore
            const result = gameSession.sortPlayersAnswersByTime(players);
            // expect(result).toEqual([mockPlayer2, mockPlayer1]);
        });
    });

    describe('sortPlayersByScore', () => {
        const mockPlayer1: Player = {
            name: 'Player1',
            role: GameRole.Player,
            socket: {} as any,
            bonus: 0,
            score: 10,
            isExcluded: false,
            hasGiveUp: false,
            // @ts-ignore
            room: mockRoom,
            // @ts-ignore
            game: gameSession,
            // @ts-ignore
            answers: [],
            setRoom: jest.fn(),
            confirmAnswer: jest.fn(),
            setAnswer: jest.fn(),
            getAnswer: jest.fn(),
            send: jest.fn(),
            on: jest.fn(),
            off: jest.fn(),
            joinRoom: jest.fn(),
            leaveRoom: jest.fn(),
            leaveAllRooms: jest.fn(),
        };

        const mockPlayer2: Player = {
            name: 'Player2',
            role: GameRole.Player,
            socket: {} as any,
            bonus: 0,
            score: 12,
            isExcluded: false,
            hasGiveUp: false,
            // @ts-ignore
            room: mockRoom,
            // @ts-ignore
            game: gameSession,
            // @ts-ignore
            answers: [],
            setRoom: jest.fn(),
            confirmAnswer: jest.fn(),
            setAnswer: jest.fn(),
            getAnswer: jest.fn(),
            send: jest.fn(),
            on: jest.fn(),
            off: jest.fn(),
            joinRoom: jest.fn(),
            leaveRoom: jest.fn(),
            leaveAllRooms: jest.fn(),
        };

        const mockPlayer3: Player = {
            name: 'Alayer3',
            role: GameRole.Player,
            socket: {} as any,
            bonus: 0,
            score: 10,
            isExcluded: false,
            hasGiveUp: false,
            // @ts-ignore
            room: mockRoom,
            // @ts-ignore
            game: gameSession,
            // @ts-ignore
            answers: [],
            setRoom: jest.fn(),
            confirmAnswer: jest.fn(),
            setAnswer: jest.fn(),
            getAnswer: jest.fn(),
            send: jest.fn(),
            on: jest.fn(),
            off: jest.fn(),
            joinRoom: jest.fn(),
            leaveRoom: jest.fn(),
            leaveAllRooms: jest.fn(),
        };

        it('should sort players by score', () => {
            const players: Player[] = [mockPlayer1, mockPlayer2];
            // @ts-ignore
            const result = gameSession.sortPlayersByScore(players);
            expect(result).toEqual([mockPlayer2, mockPlayer1]);
        });

        it('should sort players by name if results is same', () => {
            const players: Player[] = [mockPlayer1, mockPlayer3];
            // @ts-ignore
            const result = gameSession.sortPlayersByScore(players);
            expect(result).toEqual([mockPlayer3, mockPlayer1]);
        });
    });

    describe('simpleDelay', () => {});

    describe('isCorrectAnswer', () => {
        it('should return true for correct answers', () => {
            const correctAnswers = [1, 3];
            const playerAnswer = [1, 3];

            // @ts-ignore
            const result = gameSession.isCorrectAnswer(playerAnswer, correctAnswers);

            expect(result).toBe(true);
        });

        it('should return false for incorrect answers', () => {
            const correctAnswers = [1, 3];
            const playerAnswer = [2, 2];

            // @ts-ignore
            const result = gameSession.isCorrectAnswer(playerAnswer, correctAnswers);

            expect(result).toBe(false);
        });
    });
    describe('getAmountOfPlayersWhoAnswered', () => {
        const mockPlayer1: Partial<Player> = {
            name: 'Player1',
            role: GameRole.Player,
            socket: {} as any,
            bonus: 0,
            score: 0,
            isExcluded: false,
            hasGiveUp: false,
            getAnswer: jest.fn(() => ({
                hasInterracted: true,
                hasConfirmed: true,
                hasConfirmedAt: new Date(),
                answer: [0, 1],
            })),
        };

        const mockPlayer2: Partial<Player> = {
            name: 'Player2',
            role: GameRole.Player,
            socket: {} as any,
            bonus: 0,
            score: 0,
            isExcluded: false,
            hasGiveUp: false,
            getAnswer: jest.fn(() => ({
                hasInterracted: true,
                hasConfirmed: true,
                hasConfirmedAt: new Date(),
                answer: [0, 1],
            })),
        };

        const mockSetGame = jest.fn();

        // eslint-disable-next-line @typescript-eslint/no-shadow
        const mockRoom: Partial<Room> = {
            getOnlyGamePlayers: jest.fn(() => [mockPlayer1 as Player, mockPlayer2 as Player]),
            setGame: mockSetGame,
        };

        it('should correctly count players who answered each choice', () => {
            // eslint-disable-next-line @typescript-eslint/no-shadow
            const gameSession = new GameSession('test-code', mockRoom as unknown as Room, quiz, GameType.Default, historyService);
            // @ts-ignore
            const result = gameSession.getAmountOfPlayersWhoAnswered(2);
            expect(result).toEqual([2, 2, 0, 0]);
        });

        it('should not change the array, if no players are choosed for answers', () => {
            // @ts-ignore
            const result = gameSession.getAmountOfPlayersWhoAnswered(0);
            expect(result).toEqual([0, 0, 0, 0]);
        });
    });
});
