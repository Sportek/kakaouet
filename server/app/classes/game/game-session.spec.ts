/* eslint-disable max-lines */
import { Player } from '@app/classes/player/player';
import { Room } from '@app/classes/room/room';
import { Timer } from '@app/classes/timer';
import { GameService } from '@app/services/game/game.service';
import { HistoryService } from '@app/services/history/history.service';
import { NEXT_QUESTION_DELAY, QRL_DELAY, START_GAME_DELAY } from '@common/constants';
import { ChoiceData, GameEvents } from '@common/game-types';
import { GameRecords, GameRole, GameState, GameType, Quiz } from '@common/types';
import { Server, Socket } from 'socket.io';
import { GameSession } from './game-session';

const gameServiceMock = {} as GameService;
const historyServiceMock = {} as HistoryService;

const quizMock: Quiz = {
    title: 'Thomas',
    description: 'Salut, je suis thomas et je pue',
    duration: 10,
    questions: [
        {
            text: 'Quelle est la capitale de la France ?',
            type: 'QCM',
            points: 10,
            choices: [
                {
                    text: 'Paris',
                    isCorrect: true,
                },
                {
                    text: 'Londres',
                    isCorrect: false,
                },
                {
                    text: 'Berlin',
                    isCorrect: false,
                },
            ],
        },
        {
            text: "Quelle est la capitale de l'Allemagne ?",
            type: 'QCM',
            points: 10,
            choices: [
                {
                    text: 'Paris',
                    isCorrect: false,
                },
                {
                    text: 'Londres',
                    isCorrect: false,
                },
                {
                    text: 'Berlin',
                    isCorrect: true,
                },
            ],
        },
        {
            text: 'Quelle est la capitale du Canada?',
            type: 'QRL',
            points: 20,
        },
    ],
} as Quiz;

const choiceData: ChoiceData[][] = [
    [
        { text: 'Paris', amount: 1, isCorrect: true },
        { text: 'Londres', amount: 1, isCorrect: false },
        { text: 'Berlin', amount: 1, isCorrect: false },
    ],
    [
        { text: 'Paris', amount: 1, isCorrect: false },
        { text: 'Londres', amount: 1, isCorrect: false },
        { text: 'Berlin', amount: 1, isCorrect: true },
    ],
    [
        { text: '0%', amount: 0, isCorrect: true },
        { text: '50%', amount: 0, isCorrect: true },
        { text: '100%', amount: 0, isCorrect: true },
    ],
];

const gameRecordMock: GameRecords = {
    gameTitle: 'Thomas',
    startTime: new Date(),
    numberOfPlayers: 2,
    bestScore: 10,
};

const playerMock: Player = new Player('Sportek', {} as Socket, GameRole.Player);
playerMock.send = jest.fn();
playerMock.on = jest.fn();
playerMock.off = jest.fn();
playerMock.joinRoom = jest.fn();
playerMock.leaveRoom = jest.fn();
playerMock.leaveAllRooms = jest.fn();

const playerMock2: Player = new Player('Thomas', {} as Socket, GameRole.Player);
playerMock2.send = jest.fn();
playerMock2.on = jest.fn();
playerMock2.off = jest.fn();
playerMock2.joinRoom = jest.fn();
playerMock2.leaveRoom = jest.fn();
playerMock2.leaveAllRooms = jest.fn();

describe('GameSession', () => {
    let gameSession: GameSession;
    let room: Room;
    let createNewHistorySpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        historyServiceMock.createNewHistory = jest.fn();
        createNewHistorySpy = jest.spyOn(historyServiceMock, 'createNewHistory').mockResolvedValue(gameRecordMock);
        const server = new Server();
        room = new Room('1234', server, gameServiceMock);
        gameSession = new GameSession('1234', room, quizMock, GameType.Default, historyServiceMock);
    });

    it('should initialize correctly', () => {
        expect(gameSession.gameState).toBe(GameState.WaitingPlayers);
        expect(gameSession.gameQuestionIndex).toEqual(0);
        expect(gameSession.code).toEqual('1234');
        expect(gameSession.room).toBe(room);
        expect(gameSession.quiz).toBe(quizMock);
        expect(gameSession.isLocked).toEqual(false);
        expect(gameSession.room.getGame()).toEqual(gameSession);
        expect(gameSession.type).toEqual(GameType.Default);
        // @ts-ignore
        expect(gameSession.isAlreadyChangingQuestion).toBe(false);
        // @ts-ignore
        expect(gameSession.historyService).toEqual(historyServiceMock);
        // @ts-ignore
        expect(gameSession.ratingAmounts).toEqual(new Map<string, number[]>());
    });

    describe('startGameDelayed', () => {
        it('should return if not waiting for players', () => {
            gameSession.gameState = GameState.DisplayQuestionResults;
            // @ts-ignore
            const simpleDelaySpy = jest.spyOn(gameSession, 'simpleDelay');
            gameSession.startGameDelayed();
            expect(simpleDelaySpy).not.toHaveBeenCalled();
        });

        it('should start game if test game', () => {
            gameSession.type = GameType.Test;
            const startGameSpy = jest.spyOn(gameSession, 'startGame');
            gameSession.startGameDelayed();
            expect(startGameSpy).toHaveBeenCalled();
        });

        it('should initiate a delay', () => {
            gameSession.gameState = GameState.WaitingPlayers;
            // @ts-ignore
            const simpleDelaySpy = jest.spyOn(gameSession, 'simpleDelay');
            gameSession.startGameDelayed();
            expect(simpleDelaySpy).toHaveBeenCalledWith(START_GAME_DELAY, expect.any(Function));
        });

        it('should start game after a delay', () => {
            gameSession.gameState = GameState.WaitingPlayers;
            // @ts-ignore
            jest.spyOn(gameSession, 'simpleDelay').mockImplementation((delay: number, callback: () => void) => {
                callback();
            });
            const startGameSpy = jest.spyOn(gameSession, 'startGame');
            gameSession.startGameDelayed();
            expect(startGameSpy).toHaveBeenCalled();
        });
    });

    it('should start game', () => {
        // @ts-ignore
        const broadcastGameNextQuestionSpy = jest.spyOn(gameSession, 'broadcastGameNextQuestion');
        const startQuestionCooldownSpy = jest.spyOn(gameSession, 'startQuestionCooldown');
        gameSession.startGame();
        expect(gameSession.gameState).toEqual(GameState.PlayersAnswerQuestion);
        expect(broadcastGameNextQuestionSpy).toHaveBeenCalled();
        expect(startQuestionCooldownSpy).toHaveBeenCalled();
    });

    describe('startQuestionCooldown', () => {
        it("should return if players aren't answering", () => {
            gameSession.gameState = GameState.WaitingPlayers;
            // @ts-ignore
            const simpleDelaySpy = jest.spyOn(gameSession, 'simpleDelay');
            gameSession.startQuestionCooldown();
            expect(simpleDelaySpy).not.toHaveBeenCalled();
        });

        it('should start a 10 second delay for QCM', () => {
            gameSession.gameState = GameState.PlayersAnswerQuestion;
            // @ts-ignore
            const simpleDelaySpy = jest.spyOn(gameSession, 'simpleDelay');
            gameSession.startQuestionCooldown();
            expect(simpleDelaySpy).toHaveBeenCalledWith(quizMock.duration, expect.any(Function));
        });

        it('should start 60 second delay for QRL', () => {
            gameSession.gameState = GameState.PlayersAnswerQuestion;
            gameSession.gameQuestionIndex = 2;
            // @ts-ignore
            const simpleDelaySpy = jest.spyOn(gameSession, 'simpleDelay');
            gameSession.startQuestionCooldown();
            expect(simpleDelaySpy).toHaveBeenCalledWith(QRL_DELAY, expect.any(Function));
        });

        it('should have organizer rate questions', () => {
            gameSession.gameState = GameState.PlayersAnswerQuestion;
            gameSession.gameQuestionIndex = 2;
            // @ts-ignore
            jest.spyOn(gameSession, 'simpleDelay').mockImplementation((delay: number, callback: () => void) => {
                callback();
            });
            const changeStateSpy = jest.spyOn(gameSession, 'changeGameState');
            const displayQuestionResultsSpy = jest.spyOn(gameSession, 'displayQuestionResults');
            gameSession.startQuestionCooldown();
            expect(changeStateSpy).toHaveBeenCalledWith(GameState.OrganisatorCorrectingAnswers);
            expect(displayQuestionResultsSpy).not.toHaveBeenCalled();
        });

        it('should display question results if test game', () => {
            gameSession.gameState = GameState.PlayersAnswerQuestion;
            gameSession.gameQuestionIndex = 2;
            gameSession.type = GameType.Test;
            // @ts-ignore
            jest.spyOn(gameSession, 'simpleDelay').mockImplementation((delay: number, callback: () => void) => {
                callback();
            });
            const changeStateSpy = jest.spyOn(gameSession, 'changeGameState').mockImplementation(() => {
                return;
            });
            const displayQuestionResultsSpy = jest.spyOn(gameSession, 'displayQuestionResults').mockImplementation(() => {
                return;
            });
            gameSession.startQuestionCooldown();
            expect(changeStateSpy).not.toHaveBeenCalled();
            expect(displayQuestionResultsSpy).toHaveBeenCalled();
        });

        it('should display question results if QCM', () => {
            gameSession.gameState = GameState.PlayersAnswerQuestion;
            gameSession.gameQuestionIndex = 1;
            // @ts-ignore
            jest.spyOn(gameSession, 'simpleDelay').mockImplementation((delay: number, callback: () => void) => {
                callback();
            });
            const changeStateSpy = jest.spyOn(gameSession, 'changeGameState').mockImplementation(() => {
                return;
            });
            const displayQuestionResultsSpy = jest.spyOn(gameSession, 'displayQuestionResults').mockImplementation(() => {
                return;
            });
            gameSession.startQuestionCooldown();
            expect(changeStateSpy).not.toHaveBeenCalled();
            expect(displayQuestionResultsSpy).toHaveBeenCalled();
        });
    });

    describe('displayQuestionResults', () => {
        it('should display question results', () => {
            const changeGameStateSpy = jest.spyOn(gameSession, 'changeGameState');
            // @ts-ignore
            const sendScoresSpy = jest.spyOn(gameSession, 'sendScores');
            const nextQuestionSpy = jest.spyOn(gameSession, 'nextQuestion');
            gameSession.displayQuestionResults();
            expect(changeGameStateSpy).toHaveBeenCalledWith(GameState.DisplayQuestionResults);
            expect(sendScoresSpy).toHaveBeenCalled();
            expect(nextQuestionSpy).not.toHaveBeenCalled();
        });

        it('should go next question if random game', () => {
            gameSession.type = GameType.Random;
            const nextQuestionSpy = jest.spyOn(gameSession, 'nextQuestion');
            gameSession.displayQuestionResults();
            expect(nextQuestionSpy).toHaveBeenCalled();
        });

        it('should go next question if test game', () => {
            gameSession.type = GameType.Test;
            const nextQuestionSpy = jest.spyOn(gameSession, 'nextQuestion');
            gameSession.displayQuestionResults();
            expect(nextQuestionSpy).toHaveBeenCalled();
        });
    });

    describe('nextQuestion', () => {
        it('should return if not displaying question results', () => {
            gameSession.gameState = GameState.WaitingPlayers;
            // @ts-ignore
            const simpleDelaySpy = jest.spyOn(gameSession, 'simpleDelay');
            gameSession.nextQuestion();
            expect(simpleDelaySpy).not.toHaveBeenCalled();
        });

        it('should return if already changing question', () => {
            gameSession.gameState = GameState.DisplayQuestionResults;
            // @ts-ignore
            gameSession.isAlreadyChangingQuestion = true;
            // @ts-ignore
            const simpleDelaySpy = jest.spyOn(gameSession, 'simpleDelay');
            gameSession.nextQuestion();
            expect(simpleDelaySpy).not.toHaveBeenCalled();
        });

        it('should display results if last question', () => {
            gameSession.gameState = GameState.DisplayQuestionResults;
            gameSession.gameQuestionIndex = 2;
            const displayResultsSpy = jest.spyOn(gameSession, 'displayResults').mockImplementation(() => {
                return;
            });
            gameSession.nextQuestion();
            expect(displayResultsSpy).toHaveBeenCalled();
        });

        it('should go next question', () => {
            playerMock.setRoom(room);
            gameSession.room.addPlayer(playerMock);
            playerMock2.setRoom(room);
            gameSession.room.addPlayer(playerMock2);
            gameSession.gameState = GameState.DisplayQuestionResults;
            // @ts-ignore
            const simpleDelaySpy = jest.spyOn(gameSession, 'simpleDelay').mockImplementation((delay: number, callback: () => void) => {
                callback();
            });
            const changeStateSpy = jest.spyOn(gameSession, 'changeGameState').mockImplementation(() => {
                return;
            });
            gameSession.room.players[0].hasAnswered = true;
            // @ts-ignore
            const broadcastGameNextQuestionSpy = jest.spyOn(gameSession, 'broadcastGameNextQuestion').mockImplementation(() => {
                return;
            });
            const startQuestionCooldownSpy = jest.spyOn(gameSession, 'startQuestionCooldown').mockImplementation(() => {
                return;
            });
            gameSession.nextQuestion();
            expect(simpleDelaySpy).toHaveBeenCalledWith(NEXT_QUESTION_DELAY, expect.any(Function));
            expect(changeStateSpy).toHaveBeenCalledWith(GameState.PlayersAnswerQuestion);
            expect(gameSession.room.players[0].hasAnswered).toEqual(false);
            expect(broadcastGameNextQuestionSpy).toHaveBeenCalled();
            expect(startQuestionCooldownSpy).toHaveBeenCalled();
        });
    });

    it('should display results', () => {
        // @ts-ignore
        const simpleDelaySpy = jest.spyOn(gameSession, 'simpleDelay').mockImplementation((delay: number, callback: () => void) => {
            callback();
        });
        const changeStateSpy = jest.spyOn(gameSession, 'changeGameState').mockImplementation(() => {
            return;
        });
        const sendResultsToPlayersSpy = jest.spyOn(gameSession, 'sendResultsToPlayers').mockImplementation(() => {
            return;
        });
        const endGameSpy = jest.spyOn(gameSession, 'endGame').mockResolvedValue();
        gameSession.displayResults();
        expect(simpleDelaySpy).toHaveBeenCalledWith(NEXT_QUESTION_DELAY, expect.any(Function));
        expect(changeStateSpy).toHaveBeenCalledWith(GameState.DisplayQuizResults);
        expect(sendResultsToPlayersSpy).toHaveBeenCalled();
        expect(endGameSpy).toHaveBeenCalled();
    });

    describe('sendResultsToPlayers', () => {
        beforeEach(() => {
            playerMock2.score = quizMock.questions[0].points;
            playerMock2.setRoom(room);
            gameSession.room.addPlayer(playerMock2);
            playerMock.setRoom(room);
            gameSession.room.addPlayer(playerMock);
        });
        it('should return if not displaying quiz results', () => {
            gameSession.gameState = GameState.OrganisatorCorrectingAnswers;
            // @ts-ignore
            const sortPlayersByScoreSpy = jest.spyOn(gameSession, 'sortPlayersByScore');
            gameSession.sendResultsToPlayers();
            expect(sortPlayersByScoreSpy).not.toHaveBeenCalled();
        });

        it('should sort players correctly', () => {
            gameSession.gameState = GameState.DisplayQuizResults;
            // @ts-ignore
            const sortPlayersByScoreSpy = jest.spyOn(gameSession, 'sortPlayersByScore').mockImplementation(() => {
                return [playerMock, playerMock2];
            });
            // @ts-ignore
            const broadcastPlayerResultsSpy = jest.spyOn(gameSession, 'broadcastPlayerResults').mockImplementation(() => {
                return;
            });
            // @ts-ignore
            const calculateCorrectChoicesSpy = jest.spyOn(gameSession, 'calculateCorrectChoices').mockImplementation(() => {
                return;
            });
            gameSession.sendResultsToPlayers();
            expect(sortPlayersByScoreSpy).toHaveBeenCalledWith([playerMock2, playerMock]);
            expect(broadcastPlayerResultsSpy).toHaveBeenCalledWith(
                [
                    { name: 'Sportek', score: 0, bonus: 0 },
                    { name: 'Thomas', score: 10, bonus: 0 },
                ],
                undefined,
            );
            expect(calculateCorrectChoicesSpy).toHaveBeenCalled();
        });
    });

    it('should end game', async () => {
        playerMock2.score = quizMock.questions[0].points;
        playerMock.setRoom(room);
        gameSession.room.addPlayer(playerMock);
        playerMock2.setRoom(room);
        gameSession.room.addPlayer(playerMock2);
        const changeGameStateSpy = jest.spyOn(gameSession, 'changeGameState').mockImplementation(() => {
            return;
        });
        // @ts-ignore
        gameRecordMock.startTime = gameSession.startTime;
        await gameSession.endGame();
        expect(changeGameStateSpy).toHaveBeenCalled();
        expect(createNewHistorySpy).toHaveBeenCalledWith(gameRecordMock);
    });

    describe('changeGameState', () => {
        it('should filter null answers if organiser in rating questions', () => {
            // @ts-ignore
            const filterNullAnswersSpy = jest.spyOn(gameSession, 'filterNullAnswers').mockImplementation(() => {
                return;
            });
            gameSession.changeGameState(GameState.OrganisatorCorrectingAnswers);
            expect(filterNullAnswersSpy).toHaveBeenCalled();
        });

        it('should change game state', () => {
            // @ts-ignore
            gameSession.isAlreadyChangingQuestion = true;
            // @ts-ignore
            const filterNullAnswersSpy = jest.spyOn(gameSession, 'filterNullAnswers').mockImplementation(() => {
                return;
            });
            const roomBroadcastSpy = jest.spyOn(gameSession.room, 'broadcast').mockImplementation(() => {
                return;
            });
            gameSession.changeGameState(GameState.DisplayQuestionResults);
            expect(gameSession.gameState).toEqual(GameState.DisplayQuestionResults);
            expect(filterNullAnswersSpy).not.toHaveBeenCalled();
            expect(roomBroadcastSpy).toHaveBeenCalledWith(GameEvents.GameStateChanged, {}, { gameState: GameState.DisplayQuestionResults });
            // @ts-ignore
            expect(gameSession.isAlreadyChangingQuestion).toEqual(false);
        });
    });

    it('should change lock state', () => {
        const roomBroadcastSpy = jest.spyOn(gameSession.room, 'broadcast').mockImplementation(() => {
            return;
        });
        gameSession.isLocked = false;
        gameSession.changeGameLockState();
        expect(gameSession.isLocked).toEqual(true);
        expect(roomBroadcastSpy).toHaveBeenCalledWith(GameEvents.GameLockedStateChanged, {}, { isLocked: true });
    });

    describe('toggleTimer', () => {
        it('should toggle timer', () => {
            gameSession.timer = new Timer(QRL_DELAY);
            gameSession.toggleTimer();
            // @ts-ignore
            expect(gameSession.timer.isPaused).toEqual(true);
        });

        it("shouldn't toggle timer", () => {
            // @ts-ignore
            const timerToggleMock = jest.spyOn(Timer.prototype, 'togglePlayPause');
            gameSession.toggleTimer();
            expect(timerToggleMock).not.toHaveBeenCalled();
        });
    });

    describe('speedUpTimer', () => {
        it('should speed up timer', () => {
            gameSession.timer = new Timer(QRL_DELAY);
            const timerToggleMock = jest.spyOn(Timer.prototype, 'speedUp');
            const roomBroadcastSpy = jest.spyOn(gameSession.room, 'broadcast').mockImplementation(() => {
                return;
            });
            gameSession.speedUpTimer();
            expect(timerToggleMock).toHaveBeenCalled();
            expect(roomBroadcastSpy).toHaveBeenCalledWith(GameEvents.GameSpeedUpTimer, {});
        });

        it("shouldn't speed up timer", () => {
            const timerToggleMock = jest.spyOn(Timer.prototype, 'speedUp');
            gameSession.toggleTimer();
            expect(timerToggleMock).not.toHaveBeenCalled();
        });
    });

    describe('broadcastMessage', () => {
        it('should broadcast message from Sportek', () => {
            const roomBroadcastSpy = jest.spyOn(gameSession.room, 'broadcast').mockImplementation(() => {
                return;
            });
            gameSession.broadcastMessage('Tu pue', playerMock);
            expect(roomBroadcastSpy).toHaveBeenCalledWith(
                GameEvents.PlayerSendMessage,
                {},
                { name: playerMock.name, content: 'Tu pue', createdAt: expect.any(Date) },
            );
        });

        it('should broadcast message from no name', () => {
            const roomBroadcastSpy = jest.spyOn(gameSession.room, 'broadcast').mockImplementation(() => {
                return;
            });
            gameSession.broadcastMessage('Tu pue');
            expect(roomBroadcastSpy).toHaveBeenCalledWith(
                GameEvents.PlayerSendMessage,
                {},
                { name: '', content: 'Tu pue', createdAt: expect.any(Date) },
            );
        });
    });

    describe('saveAnswerRatings', () => {
        it('should create new ratings table and save ratings', () => {
            playerMock.score = 0;
            playerMock.hasAnswered = false;
            // @ts-ignore
            gameSession.ratingAmounts = new Map<string, number[]>();
            gameSession.gameQuestionIndex = 2;
            const playerHasConfirmedSpy = jest.spyOn(playerMock, 'confirmAnswer').mockImplementation(() => {
                return;
            });
            gameSession.saveAnswerRatings(playerMock, quizMock.questions[2].points);
            expect(playerHasConfirmedSpy).toHaveBeenCalled();
            expect(playerMock.hasAnswered).toEqual(true);
            expect(playerMock.score).toEqual(quizMock.questions[2].points);
            // @ts-ignore
            expect(gameSession.ratingAmounts[quizMock.questions[2].text]).toEqual([0, 0, 1]);
        });

        it('should add to ratings table', () => {
            playerMock2.score = 0;
            playerMock2.hasAnswered = false;
            gameSession.gameQuestionIndex = 2;
            // @ts-ignore
            gameSession.ratingAmounts = { [quizMock.questions[2].text]: [0, 0, 1] };
            const playerHasConfirmedSpy = jest.spyOn(playerMock2, 'confirmAnswer').mockImplementation(() => {
                return;
            });
            gameSession.saveAnswerRatings(playerMock2, quizMock.questions[2].points);
            expect(playerHasConfirmedSpy).toHaveBeenCalled();
            expect(playerMock2.hasAnswered).toEqual(true);
            expect(playerMock2.score).toEqual(quizMock.questions[2].points);
            // @ts-ignore
            expect(gameSession.ratingAmounts[quizMock.questions[2].text]).toEqual([0, 0, 2]);
        });
    });

    describe('filterNullAnswers', () => {
        beforeEach(() => {
            playerMock2.setRoom(room);
            gameSession.room.addPlayer(playerMock2);
            playerMock.setRoom(room);
            gameSession.room.addPlayer(playerMock);
            // @ts-ignore
            playerMock.answers = [];
            // @ts-ignore
            playerMock2.answers = [];
        });

        it('should filter no players if all have answered', () => {
            gameSession.gameQuestionIndex = 2;
            const confirmAnswerSpy = jest.spyOn(playerMock, 'confirmAnswer').mockImplementation(() => {
                return;
            });
            const confirmAnswerSpy2 = jest.spyOn(playerMock2, 'confirmAnswer').mockImplementation(() => {
                return;
            });
            playerMock.setAnswer('Allo');
            playerMock2.setAnswer('Yo');
            // @ts-ignore
            gameSession.filterNullAnswers();
            expect(confirmAnswerSpy).not.toHaveBeenCalled();
            expect(confirmAnswerSpy2).not.toHaveBeenCalled();
        });

        it('should not filter players that have give up', () => {
            const confirmAnswerSpy = jest.spyOn(playerMock, 'confirmAnswer').mockImplementation(() => {
                return;
            });
            const confirmAnswerSpy2 = jest.spyOn(playerMock2, 'confirmAnswer').mockImplementation(() => {
                return;
            });
            playerMock.hasGiveUp = true;
            playerMock2.hasGiveUp = true;
            // @ts-ignore
            gameSession.filterNullAnswers();
            expect(confirmAnswerSpy).not.toHaveBeenCalled();
            expect(confirmAnswerSpy2).not.toHaveBeenCalled();
        });

        it('should filter players with null answers', () => {
            gameSession.gameQuestionIndex = 1;
            playerMock2.setAnswer('Yo');
            playerMock.hasGiveUp = false;
            const confirmAnswerSpy = jest.spyOn(playerMock, 'confirmAnswer').mockImplementation(() => {
                return;
            });
            const confirmAnswerSpy2 = jest.spyOn(playerMock2, 'confirmAnswer').mockImplementation(() => {
                return;
            });
            const roomBroadcastSpy = jest.spyOn(gameSession.room, 'broadcast').mockImplementation(() => {
                return;
            });
            // @ts-ignore
            gameSession.filterNullAnswers();
            expect(confirmAnswerSpy).toHaveBeenCalledTimes(1);
            expect(confirmAnswerSpy2).not.toHaveBeenCalled();
            expect(roomBroadcastSpy).toHaveBeenCalledWith(GameEvents.PlayerNotInteractQrl, {}, { name: playerMock.name });
        });
    });

    describe('broadcastCorrectAnswers', () => {
        it('should return if QRL', () => {
            const roomBroadcastSpy = jest.spyOn(gameSession.room, 'broadcast').mockImplementation(() => {
                return;
            });
            // @ts-ignore
            gameSession.broadcastCorrectAnswers(quizMock.questions[2]);
            expect(roomBroadcastSpy).not.toHaveBeenCalled();
        });

        it('should broadcast correct answers', () => {
            const roomBroadcastSpy = jest.spyOn(gameSession.room, 'broadcast').mockImplementation(() => {
                return;
            });
            // @ts-ignore
            gameSession.broadcastCorrectAnswers(quizMock.questions[0]);
            expect(roomBroadcastSpy).toHaveBeenCalledWith(
                GameEvents.SendCorrectAnswers,
                {},
                {
                    choices: [
                        {
                            text: 'Paris',
                            isCorrect: true,
                        },
                    ],
                },
            );
        });
    });

    describe('sortPlayersAnswersByTime', () => {
        beforeEach(() => {
            // @ts-ignore
            playerMock.answers = [];
            // @ts-ignore
            playerMock2.answers = [];
        });

        it('should not sort players if player 1 has not answered', () => {
            gameSession.gameQuestionIndex = 2;
            jest.spyOn(playerMock, 'getAnswer').mockImplementation(() => {
                return {
                    answer: 'yo',
                    hasInterracted: true,
                    hasConfirmed: true,
                    hasConfirmedAt: new Date(),
                };
            });
            jest.spyOn(playerMock2, 'getAnswer').mockImplementation(() => {
                return null;
            });
            // @ts-ignore
            const result = gameSession.sortPlayersAnswersByTime([playerMock, playerMock2]);
            expect(result).toEqual([playerMock, playerMock2]);
        });

        it('should not sort players if player 2 has not answered', () => {
            gameSession.gameQuestionIndex = 2;
            jest.spyOn(playerMock, 'getAnswer').mockImplementation(() => {
                return {
                    answer: 'yo',
                    hasInterracted: true,
                    hasConfirmed: true,
                    hasConfirmedAt: new Date(),
                };
            });
            jest.spyOn(playerMock2, 'getAnswer').mockImplementation(() => {
                return null;
            });
            // @ts-ignore
            const result = gameSession.sortPlayersAnswersByTime([playerMock2, playerMock]);
            expect(result).toEqual([playerMock2, playerMock]);
        });

        it('should not sort if already sorted', () => {
            gameSession.gameQuestionIndex = 2;
            jest.spyOn(playerMock, 'getAnswer').mockImplementation(() => {
                return {
                    answer: 'yo',
                    hasInterracted: true,
                    hasConfirmed: true,
                    hasConfirmedAt: new Date('2023-03-25T12:00:00Z'),
                };
            });
            jest.spyOn(playerMock2, 'getAnswer').mockImplementation(() => {
                return {
                    answer: 'yo',
                    hasInterracted: true,
                    hasConfirmed: true,
                    hasConfirmedAt: new Date('2023-03-26T12:00:00Z'),
                };
            });
            // @ts-ignore
            const result = gameSession.sortPlayersAnswersByTime([playerMock, playerMock2]);
            expect(result[0].name).toEqual(playerMock.name);
            expect(result[1].name).toEqual(playerMock2.name);
        });

        it('should not sort if missing dates', () => {
            gameSession.gameQuestionIndex = 2;
            jest.spyOn(playerMock, 'getAnswer').mockImplementation(() => {
                return {
                    answer: 'yo',
                    hasInterracted: true,
                    hasConfirmed: true,
                };
            });
            jest.spyOn(playerMock2, 'getAnswer').mockImplementation(() => {
                return {
                    answer: 'yo',
                    hasInterracted: true,
                    hasConfirmed: true,
                };
            });
            // @ts-ignore
            const result = gameSession.sortPlayersAnswersByTime([playerMock2, playerMock]);
            expect(result[0].name).toEqual(playerMock2.name);
            expect(result[1].name).toEqual(playerMock.name);
        });

        it('should sort players', () => {
            gameSession.gameQuestionIndex = 2;
            jest.spyOn(playerMock, 'getAnswer').mockImplementation(() => {
                return {
                    answer: 'yo',
                    hasInterracted: true,
                    hasConfirmed: true,
                    hasConfirmedAt: new Date('2023-03-25T12:00:00Z'),
                };
            });
            jest.spyOn(playerMock2, 'getAnswer').mockImplementation(() => {
                return {
                    answer: 'yo',
                    hasInterracted: true,
                    hasConfirmed: true,
                    hasConfirmedAt: new Date('2023-03-26T12:00:00Z'),
                };
            });
            // @ts-ignore
            const result = gameSession.sortPlayersAnswersByTime([playerMock2, playerMock]);
            expect(result[0].name).toEqual(playerMock.name);
            expect(result[1].name).toEqual(playerMock2.name);
        });
    });

    describe('filterCorrectAnswerPlayers', () => {
        it('should return no players if there are no correct answers', () => {
            jest.spyOn(playerMock, 'getAnswer').mockImplementation(() => {
                return {
                    answer: [1],
                    hasInterracted: true,
                    hasConfirmed: true,
                    hasConfirmedAt: new Date('2023-03-26T12:00:00Z'),
                };
            });
            jest.spyOn(playerMock2, 'getAnswer').mockImplementation(() => {
                return {
                    answer: [1],
                    hasInterracted: true,
                    hasConfirmed: true,
                    hasConfirmedAt: new Date('2023-03-26T12:00:00Z'),
                };
            });
            // @ts-ignore
            jest.spyOn(gameSession, 'isCorrectAnswer').mockReturnValue(false);
            // @ts-ignore
            jest.spyOn(gameSession, 'sortPlayersAnswersByTime').mockImplementation((players: Player[]) => {
                return players;
            });
            // @ts-ignore
            const result = gameSession.filterCorrectAnswerPlayers([playerMock, playerMock2], [1], quizMock.questions[1]);
            expect(result).toEqual([]);
        });

        it('should return no players if there are no answers', () => {
            jest.spyOn(playerMock, 'getAnswer').mockImplementation(() => {
                return null;
            });
            jest.spyOn(playerMock2, 'getAnswer').mockImplementation(() => {
                return null;
            });
            // @ts-ignore
            jest.spyOn(gameSession, 'sortPlayersAnswersByTime').mockImplementation((players: Player[]) => {
                return players;
            });
            // @ts-ignore
            const result = gameSession.filterCorrectAnswerPlayers([playerMock, playerMock2], [1], quizMock.questions[1]);
            expect(result).toEqual([]);
        });

        it('should return players if they have correct answers QCM', () => {
            playerMock.score = 0;
            playerMock2.score = quizMock.questions[1].points;
            jest.spyOn(playerMock, 'getAnswer').mockImplementation(() => {
                return {
                    answer: [1],
                    hasInterracted: true,
                    hasConfirmed: true,
                    hasConfirmedAt: new Date('2023-03-26T12:00:00Z'),
                };
            });
            jest.spyOn(playerMock2, 'getAnswer').mockImplementation(() => {
                return {
                    answer: [1],
                    hasInterracted: true,
                    hasConfirmed: true,
                    hasConfirmedAt: new Date('2023-03-26T12:00:00Z'),
                };
            });
            // @ts-ignore
            jest.spyOn(gameSession, 'isCorrectAnswer').mockReturnValue(true);
            // @ts-ignore
            jest.spyOn(gameSession, 'sortPlayersAnswersByTime').mockImplementation((players: Player[]) => {
                return players;
            });
            // @ts-ignore
            const result = gameSession.filterCorrectAnswerPlayers([playerMock, playerMock2], [1], quizMock.questions[1]);
            expect(result[0].name).toEqual(playerMock.name);
            expect(result[1].name).toEqual(playerMock2.name);
            expect(result[0].score).toEqual(quizMock.questions[1].points);
            expect(result[1].score).toEqual(quizMock.questions[1].points + quizMock.questions[1].points);
        });

        it('should return players if they have correct answers QRL', () => {
            playerMock.score = 0;
            playerMock.currentQuestionMultiplier = 0.5;
            playerMock2.score = quizMock.questions[1].points;
            playerMock2.currentQuestionMultiplier = 1;
            jest.spyOn(playerMock, 'getAnswer').mockImplementation(() => {
                return {
                    answer: [1],
                    hasInterracted: true,
                    hasConfirmed: true,
                    hasConfirmedAt: new Date('2023-03-26T12:00:00Z'),
                };
            });
            jest.spyOn(playerMock2, 'getAnswer').mockImplementation(() => {
                return {
                    answer: [1],
                    hasInterracted: true,
                    hasConfirmed: true,
                    hasConfirmedAt: new Date('2023-03-26T12:00:00Z'),
                };
            });
            // @ts-ignore
            jest.spyOn(gameSession, 'isCorrectAnswer').mockReturnValue(true);
            // @ts-ignore
            jest.spyOn(gameSession, 'sortPlayersAnswersByTime').mockImplementation((players: Player[]) => {
                return players;
            });
            // @ts-ignore
            const result = gameSession.filterCorrectAnswerPlayers([playerMock, playerMock2], [1], quizMock.questions[2]);
            expect(result[0].name).toEqual(playerMock.name);
            expect(result[1].name).toEqual(playerMock2.name);
            expect(result[0].score).toEqual(quizMock.questions[2].points / 2);
            expect(result[1].score).toEqual(quizMock.questions[2].points + quizMock.questions[1].points);
        });
    });

    describe('hasMultiplePlayersAnsweredCorrectly', () => {
        it('should return if there are too many players', () => {
            const getAnswerSpy = jest.spyOn(playerMock, 'getAnswer');
            // @ts-ignore
            gameSession.hasMultiplePlayersAnsweredCorrectly([playerMock]);
            expect(getAnswerSpy).not.toHaveBeenCalled();
        });

        it('should return true if both players have answered at the same time', () => {
            jest.spyOn(playerMock, 'getAnswer').mockImplementation(() => {
                return {
                    answer: [1],
                    hasInterracted: true,
                    hasConfirmed: true,
                    hasConfirmedAt: new Date('2023-03-26T12:00:00Z'),
                };
            });
            jest.spyOn(playerMock2, 'getAnswer').mockImplementation(() => {
                return {
                    answer: [1],
                    hasInterracted: true,
                    hasConfirmed: true,
                    hasConfirmedAt: new Date('2023-03-26T12:00:00Z'),
                };
            });
            // @ts-ignore
            const result = gameSession.hasMultiplePlayersAnsweredCorrectly([playerMock, playerMock2]);
            expect(result).toEqual(true);
        });

        it('should return false if both players have not answered at the same time', () => {
            jest.spyOn(playerMock, 'getAnswer').mockImplementation(() => {
                return {
                    answer: [1],
                    hasInterracted: true,
                    hasConfirmed: true,
                    hasConfirmedAt: new Date('2023-03-26T12:00:00Z'),
                };
            });
            jest.spyOn(playerMock2, 'getAnswer').mockImplementation(() => {
                return {
                    answer: [1],
                    hasInterracted: true,
                    hasConfirmed: true,
                    hasConfirmedAt: new Date('2023-03-25T12:00:00Z'),
                };
            });
            // @ts-ignore
            const result = gameSession.hasMultiplePlayersAnsweredCorrectly([playerMock, playerMock2]);
            expect(result).toEqual(false);
        });

        it('should return undefined if both players have not answered', () => {
            jest.spyOn(playerMock, 'getAnswer').mockImplementation(() => {
                return {
                    answer: [1],
                    hasInterracted: true,
                    hasConfirmed: true,
                };
            });
            jest.spyOn(playerMock2, 'getAnswer').mockImplementation(() => {
                return {
                    answer: [1],
                    hasInterracted: true,
                    hasConfirmed: true,
                };
            });
            // @ts-ignore
            const result = gameSession.hasMultiplePlayersAnsweredCorrectly([playerMock, playerMock2]);
            expect(result).toEqual(undefined);
        });
    });

    describe('calculateScores', () => {
        beforeEach(() => {
            gameSession.room.addPlayer(playerMock);
            gameSession.room.addPlayer(playerMock2);
        });
        it('should return no players answering first', () => {
            gameSession.gameQuestionIndex = 2;
            // @ts-ignore
            const result = gameSession.calculateScores();
            expect(result[0].hasAnsweredFirst).toEqual(false);
            expect(result[1].hasAnsweredFirst).toEqual(false);
        });

        it('should add bonus to first player to answer', () => {
            playerMock.score = 0;
            playerMock.bonus = 0;
            playerMock2.score = 0;
            playerMock2.bonus = 0;
            gameSession.gameQuestionIndex = 1;
            // @ts-ignore
            const filterCorrectAnswerPlayersSpy = jest.spyOn(gameSession, 'filterCorrectAnswerPlayers').mockReturnValue([playerMock, playerMock2]);
            // @ts-ignore
            const hasMultiplePlayersAnsweredCorrectlySpy = jest.spyOn(gameSession, 'hasMultiplePlayersAnsweredCorrectly').mockReturnValue(false);
            // @ts-ignore
            const result = gameSession.calculateScores();
            expect(result[0].player.name).toEqual(playerMock.name);
            expect(result[0].player.score).toEqual(quizMock.questions[1].points / START_GAME_DELAY);
            expect(result[0].player.bonus).toEqual(1);
            expect(result[0].hasAnsweredFirst).toEqual(true);
            expect(result[1].player.name).toEqual(playerMock2.name);
            expect(result[1].player.score).toEqual(0);
            expect(result[1].player.bonus).toEqual(0);
            expect(result[1].hasAnsweredFirst).toEqual(false);
            expect(filterCorrectAnswerPlayersSpy).toHaveBeenCalled();
            expect(hasMultiplePlayersAnsweredCorrectlySpy).toHaveBeenCalled();
        });
    });

    describe('sendScores', () => {
        it('should add score to both players if QRL and test game', () => {
            // @ts-ignore
            jest.spyOn(gameSession, 'calculateScores').mockReturnValue([
                { player: playerMock, hasAnsweredFirst: true },
                { player: playerMock2, hasAnsweredFirst: false },
            ]);
            gameSession.room.addPlayer(playerMock);
            gameSession.room.addPlayer(playerMock2);
            playerMock.score = 0;
            playerMock2.score = 0;
            gameSession.type = GameType.Test;
            gameSession.gameQuestionIndex = 2;
            const playerSendSpy = jest.spyOn(playerMock, 'send').mockImplementation(() => {
                return;
            });
            const playerSendSpy2 = jest.spyOn(playerMock2, 'send').mockImplementation(() => {
                return;
            });
            const sendToOrganizerSpy = jest.spyOn(gameSession.room, 'sendToOrganizer');
            // @ts-ignore
            gameSession.sendScores();
            expect(playerSendSpy).toHaveBeenCalledWith(GameEvents.UpdateScore, { score: quizMock.questions[2].points, hasAnsweredFirst: false });
            expect(playerSendSpy2).toHaveBeenCalledWith(GameEvents.UpdateScore, { score: quizMock.questions[2].points, hasAnsweredFirst: false });
            expect(sendToOrganizerSpy).toHaveBeenCalledWith(GameEvents.SendPlayersScores, {
                scores: [
                    { name: playerMock.name, score: quizMock.questions[2].points },
                    { name: playerMock2.name, score: quizMock.questions[2].points },
                ],
            });
        });

        it('should send game scores if QCM', () => {
            jest.clearAllMocks();
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            playerMock.score = quizMock.questions[1].points * 1.2;
            playerMock2.score = quizMock.questions[1].points;
            gameSession.gameQuestionIndex = 1;
            gameSession.room.addPlayer(playerMock);
            gameSession.room.addPlayer(playerMock2);
            // @ts-ignore
            jest.spyOn(gameSession, 'calculateScores').mockReturnValue([
                { player: playerMock, hasAnsweredFirst: true },
                { player: playerMock2, hasAnsweredFirst: false },
            ]);
            const playerSendSpy = jest.spyOn(playerMock, 'send').mockImplementation(() => {
                return;
            });
            const playerSendSpy2 = jest.spyOn(playerMock2, 'send').mockImplementation(() => {
                return;
            });
            const sendToOrganizerSpy = jest.spyOn(gameSession.room, 'sendToOrganizer');
            // @ts-ignore
            gameSession.sendScores();
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            expect(playerSendSpy).toHaveBeenCalledWith(GameEvents.UpdateScore, { score: quizMock.questions[1].points * 1.2, hasAnsweredFirst: true });
            expect(playerSendSpy2).toHaveBeenCalledWith(GameEvents.UpdateScore, { score: quizMock.questions[1].points, hasAnsweredFirst: false });
            expect(sendToOrganizerSpy).toHaveBeenCalledWith(GameEvents.SendPlayersScores, {
                scores: [
                    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                    { name: playerMock.name, score: quizMock.questions[1].points * 1.2 },
                    { name: playerMock2.name, score: quizMock.questions[1].points },
                ],
            });
        });
    });

    describe('calculateCorrectChoices', () => {
        it('should return two QCM choice arrays and 1 QRL ratings array', () => {
            // @ts-ignore
            gameSession.ratingAmounts[quizMock.questions[2].text] = [0, 0, 0];
            // @ts-ignore
            const getAmountOfPlayersWhoAnsweredSpy = jest.spyOn(gameSession, 'getAmountOfPlayersWhoAnswered').mockReturnValue([1, 1, 1]);
            // @ts-ignore
            const result = gameSession.calculateCorrectChoices();
            expect(getAmountOfPlayersWhoAnsweredSpy).toHaveBeenCalled();
            expect(result).toEqual(choiceData);
        });

        it('should return if not QRL', () => {
            // @ts-ignore
            const result = gameSession.qrlRatings(quizMock.questions[1]);
            expect(result).toBeFalsy();
        });

        it('should return if not QCM', () => {
            // @ts-ignore
            const result = gameSession.qcmCorrectChoices(quizMock.questions[2]);
            expect(result).toBeFalsy();
        });
    });

    it('should broadcast player results', () => {
        const broadcastSpy = jest.spyOn(gameSession.room, 'broadcast').mockImplementation(() => {
            return;
        });
        // @ts-ignore
        gameSession.broadcastPlayerResults([{ name: 'Sportek', score: 0, bonus: 0 }], choiceData);
        expect(broadcastSpy).toHaveBeenCalledWith(
            GameEvents.PlayerSendResults,
            {},
            {
                scores: [{ name: 'Sportek', score: 0, bonus: 0 }],
                choices: choiceData,
                questions: quizMock.questions,
            },
        );
    });

    describe('sortPlayersByScore', () => {
        it('should sort by score if not the same', () => {
            playerMock.score = 0;
            playerMock2.score = 1;
            // @ts-ignore
            const result = gameSession.sortPlayersByScore([playerMock, playerMock2]);
            expect(result[0].name).toEqual(playerMock2.name);
            expect(result[1].name).toEqual(playerMock.name);
        });

        it('should sort by name if score the same', () => {
            playerMock.score = 0;
            playerMock2.score = 0;
            // @ts-ignore
            const result = gameSession.sortPlayersByScore([playerMock2, playerMock]);
            expect(result[0].name).toEqual(playerMock.name);
            expect(result[1].name).toEqual(playerMock2.name);
        });
    });

    describe('isCorrectAnswer', () => {
        it('should be true if all choices are correct', () => {
            // @ts-ignore
            const result = gameSession.isCorrectAnswer([0], [0]);
            expect(result).toEqual(true);
        });

        it('should be false if not all choices are correct', () => {
            // @ts-ignore
            const result = gameSession.isCorrectAnswer([0, 1], [0]);
            expect(result).toEqual(false);
        });
    });

    it('should return amount of players who answered each choice', () => {
        gameSession.gameQuestionIndex = 1;
        gameSession.room.addPlayer(playerMock);
        gameSession.room.addPlayer(playerMock2);
        jest.spyOn(playerMock, 'getAnswer').mockReturnValue({ hasInterracted: true, hasConfirmed: true, answer: [1] });
        jest.spyOn(playerMock2, 'getAnswer').mockReturnValue(undefined);
        // @ts-ignore
        const result = gameSession.getAmountOfPlayersWhoAnswered(1);
        expect(result).toEqual([0, 1, 0, 0]);
    });
});
