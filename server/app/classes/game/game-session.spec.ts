/* eslint-disable max-lines */
import { Player } from '@app/classes/player/player';
import { Room } from '@app/classes/room/room';
import { Timer } from '@app/classes/timer';
import { GameService } from '@app/services/game/game.service';
import { HistoryService } from '@app/services/history/history.service';
import { ChoiceData, GameEvents } from '@common/game-types';
import { GameRecords, GameRole, GameState, GameType, Quiz } from '@common/types';
import { Server, Socket } from 'socket.io';
import { GameSession } from './game-session';

const gameServiceMock = {} as GameService;
const historyServiceMock = {} as HistoryService;

const START_GAME_DELAY = 5;
const QRL_DELAY = 60;
const NEXT_QUESTION_DELAY = 3;

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
            expect(roomBroadcastSpy).toHaveBeenCalledWith(GameEvents.PlayerConfirmAnswers, {}, { name: playerMock.name });
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

// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable max-lines */
// import { Player } from '@app/classes/player/player';
// import { Room } from '@app/classes/room/room';
// import { Timer } from '@app/classes/timer';
// import { GameService } from '@app/services/game/game.service';
// import { HistoryService } from '@app/services/history/history.service';
// import { CompletePlayerAnswer, GameEvents, GameType } from '@common/game-types';
// import { GameRole, GameState, Question, QuestionType, Quiz } from '@common/types';
// import { Server } from 'socket.io';
// import { GameSession } from './game-session';

// describe('GameSession', () => {
//     let gameSession: GameSession;
//     let room: Room;
//     let quiz: Quiz;
//     let serverMock: Server;
//     let timerMock: Timer;
//     let historyService: HistoryService;
//     const NEXT_QUESTION_DELAY = 3;

//     const mockPlayer: Partial<Player> = {
//         name: 'Player 1',
//         role: GameRole.Player,
//         socket: {} as any,
//         bonus: 0,
//         score: 0,
//         isExcluded: false,
//         hasGiveUp: false,
//         setRoom: jest.fn(),
//         confirmAnswer: jest.fn(),
//         setAnswer: jest.fn(),
//         getAnswer: jest.fn(),
//         send: jest.fn(),
//         on: jest.fn(),
//         off: jest.fn(),
//         joinRoom: jest.fn(),
//         leaveRoom: jest.fn(),
//         leaveAllRooms: jest.fn(),
//     };

//     const mockRoom = {
//         code: 'test-room',
//         players: [],
//         game: {},
//         gameService: {},
//         broadcast: jest.fn(),
//         setGame: jest.fn(),
//     };

//     beforeEach(() => {
//         jest.clearAllMocks();
//         timerMock = {
//             togglePlayPause: jest.fn(),
//             speedUp: jest.fn(),
//         } as any;
//         serverMock = new Server() as unknown as Server;
//         const mockGameService = {} as GameService;
//         const historyServiceMock = {
//             createNewHistory: jest.fn().mockResolvedValue(undefined),
//         } as unknown as HistoryService;

//         room = new Room('test-room', serverMock, mockGameService);
//         quiz = {
//             _id: 'quiz123',
//             title: 'Test Quiz',
//             duration: 60,
//             description: 'A quiz for testing',
//             visibility: true,
//             questions: [
//                 {
//                     _id: 'question1',
//                     text: 'Test Question',
//                     type: QuestionType.QCM,
//                     points: 5,
//                     choices: [{ _id: 1, text: 'Choice 1', isCorrect: true }],
//                     createdAt: new Date(),
//                     lastModification: new Date(),
//                 },
//                 {
//                     _id: 'question2',
//                     text: 'Test Question 2',
//                     type: QuestionType.QCM,
//                     points: 5,
//                     choices: [{ _id: 1, text: 'Choice 2', isCorrect: true }],
//                     createdAt: new Date(),
//                     lastModification: new Date(),
//                 },
//             ],
//             createdAt: new Date(),
//             lastModification: new Date(),
//         };
//         gameSession = new GameSession('game123', room, quiz, GameType.Default, historyServiceMock);
//         gameSession.timer = timerMock;
//     });

//     afterEach(() => {
//         jest.clearAllMocks();
//     });

//     describe('GameSession.constructor', () => {
//         it('initializes correctly', () => {
//             expect(gameSession.gameState).toBe(GameState.WaitingPlayers);
//             expect(gameSession.room).toBe(room);
//             expect(gameSession.quiz).toBe(quiz);
//         });
//     });

//     describe('startGameDelayed', () => {
//         it('does nothing if gameState is not WaitingPlayers', () => {
//             gameSession.gameState = GameState.PlayersAnswerQuestion;
//             const simpleDelaySpy = jest.spyOn(gameSession as any, 'simpleDelay');
//             gameSession.startGameDelayed();
//             expect(simpleDelaySpy).not.toHaveBeenCalled();
//         });

//         it('calls startGame if type is GameType.Test', () => {
//             gameSession.type = GameType.Test;
//             const startGameSpy = jest.spyOn(gameSession, 'startGame');
//             gameSession.startGameDelayed();
//             expect(startGameSpy).toHaveBeenCalled();
//         });

//         it('does not call startGame if type is not GameType.Test', () => {
//             gameSession.type = GameType.Random;
//             const startGameSpy = jest.spyOn(gameSession, 'startGame');
//             gameSession.startGameDelayed();
//             expect(startGameSpy).not.toHaveBeenCalled();
//         });
//     });

//     describe('startGame', () => {
//         it('starGame should call changeGameState, broadcastGameNextQuestion, startQuestionCooldown', () => {
//             const changeGameStateMock = jest.spyOn(gameSession, 'changeGameState');
//             const startQuestionCooldownMock = jest.spyOn(gameSession, 'startQuestionCooldown');
//             const gameSessionAny = gameSession as any;
//             const broadcastGameNextQuestionMock = jest.spyOn(gameSessionAny, 'broadcastGameNextQuestion');

//             gameSession.startGame();

//             expect(changeGameStateMock).toHaveBeenCalledWith(GameState.PlayersAnswerQuestion);
//             expect(broadcastGameNextQuestionMock).toHaveBeenCalled();
//             expect(startQuestionCooldownMock).toHaveBeenCalled();
//         });
//     });

//     describe('startQuestionCooldown', () => {
//         it('does nothing if gameState is not PlayersAnswerQuestion', () => {
//             gameSession.gameState = GameState.WaitingPlayers;
//             const simpleDelaySpy = jest.spyOn(gameSession as unknown as { simpleDelay: () => void }, 'simpleDelay');
//             gameSession.startQuestionCooldown();
//             expect(simpleDelaySpy).not.toHaveBeenCalled();
//         });

//         it('should start cooldown and call displayQuestionResults if gameState is PlayersAnswerQuestion', () => {
//             gameSession.gameState = GameState.PlayersAnswerQuestion;

//             const simpleDelaySpy = jest.spyOn(gameSession as any, 'simpleDelay');
//             const displayQuestionResultsSpy = jest.spyOn(gameSession, 'displayQuestionResults');

//             gameSession.quiz = quiz;
//             gameSession.startQuestionCooldown();

//             expect(simpleDelaySpy).toHaveBeenCalledWith(quiz.duration, expect.any(Function));

//             const callback = simpleDelaySpy.mock.calls[0][1] as () => void;
//             callback();

//             expect(displayQuestionResultsSpy).toHaveBeenCalled();
//         });
//     });

//     describe('displayQuestionResults', () => {
//         it('should call sendScores and changeGameState', () => {
//             gameSession.type = GameType.Default;

//             const changeGameStateSpy = jest.spyOn(gameSession, 'changeGameState');
//             const sendScoresAny = gameSession as any; // because sendScores is private
//             const sendScoresSpy = jest.spyOn(sendScoresAny, 'sendScores');
//             const nextQuestionSpy = jest.spyOn(gameSession, 'nextQuestion');

//             gameSession.displayQuestionResults();

//             expect(changeGameStateSpy).toHaveBeenCalledWith(GameState.DisplayQuestionResults);
//             expect(sendScoresSpy).toHaveBeenCalled();
//             expect(nextQuestionSpy).not.toHaveBeenCalled();
//         });

//         it('should call sendScores, changeGameState, and nextQuestion for GameType.Test', () => {
//             gameSession.type = GameType.Test;

//             const changeGameStateSpy = jest.spyOn(gameSession, 'changeGameState');
//             const sendScoresAny = gameSession as any;
//             const sendScoresSpy = jest.spyOn(sendScoresAny, 'sendScores');
//             const nextQuestionSpy = jest.spyOn(gameSession, 'nextQuestion');

//             gameSession.displayQuestionResults();

//             expect(changeGameStateSpy).toHaveBeenCalledWith(GameState.DisplayQuestionResults);
//             expect(sendScoresSpy).toHaveBeenCalled();
//             expect(nextQuestionSpy).toHaveBeenCalled();
//         });
//     });

//     describe('nextQuestion', () => {
//         it('should do nothing if gameState is not DisplayQuestionResults', () => {
//             gameSession.gameState = GameState.WaitingPlayers;

//             const changeGameStateSpy = jest.spyOn(gameSession, 'changeGameState');

//             const broadcastGameNextQuestionAny = gameSession as any;
//             const broadcastGameNextQuestionSpy = jest.spyOn(broadcastGameNextQuestionAny, 'broadcastGameNextQuestion');
//             const startQuestionCooldownSpy = jest.spyOn(gameSession, 'startQuestionCooldown');

//             gameSession.nextQuestion();

//             expect(changeGameStateSpy).not.toHaveBeenCalled();
//             expect(broadcastGameNextQuestionSpy).not.toHaveBeenCalled();
//             expect(startQuestionCooldownSpy).not.toHaveBeenCalled();
//         });

//         it('should call displayResults if gameQuestionIndex is equal to the number of questions', () => {
//             gameSession.gameState = GameState.DisplayQuestionResults;
//             gameSession.gameQuestionIndex = quiz.questions.length;
//             const displayResultsSpy = jest.spyOn(gameSession, 'displayResults');

//             gameSession.nextQuestion();

//             expect(displayResultsSpy).toHaveBeenCalled();
//         });

//         it('should change game state and callchangeGameState, broadcastGameNextQuestion and startQuestionCooldown', () => {});
//     });

//     describe('displayResults', () => {
//         it('should call sendResultsToPlayers and changeGameState after delay', () => {
//             const changeGameStateSpy = jest.spyOn(gameSession, 'changeGameState');
//             const sendResultsToPlayersSpy = jest.spyOn(gameSession, 'sendResultsToPlayers');

//             jest.spyOn(gameSession as any, 'simpleDelay').mockImplementation((delay: number, callback: () => void) => {
//                 callback();
//             });

//             gameSession.displayResults();

//             expect(changeGameStateSpy).toHaveBeenCalledWith(GameState.DisplayQuizResults);
//             expect(sendResultsToPlayersSpy).toHaveBeenCalled();
//         });

//         it('should call simpleDelay with correct parameters', () => {
//             const simpleDelaySpy = jest.spyOn(gameSession as any, 'simpleDelay');
//             gameSession.displayResults();
//             expect(simpleDelaySpy).toHaveBeenCalledWith(NEXT_QUESTION_DELAY, expect.any(Function));
//         });
//     });

//     describe('sendResultsToPlayers', () => {
//         it('should not send results if gameState is not DisplayQuizResults', () => {
//             gameSession.gameState = GameState.WaitingPlayers;

//             const sortPlayersByScoreAny = gameSession as any;
//             const sortPlayersByScoreSpy = jest.spyOn(sortPlayersByScoreAny, 'sortPlayersByScore');
//             const broadcastPlayerResultsAny = gameSession as any;
//             const broadcastPlayerResultsSpy = jest.spyOn(broadcastPlayerResultsAny, 'broadcastPlayerResults');
//             const calculateCorrectChoicesAny = gameSession as any;
//             const calculateCorrectChoicesSpy = jest.spyOn(calculateCorrectChoicesAny, 'calculateCorrectChoices');

//             gameSession.sendResultsToPlayers();

//             expect(sortPlayersByScoreSpy).not.toHaveBeenCalled();
//             expect(broadcastPlayerResultsSpy).not.toHaveBeenCalled();
//             expect(calculateCorrectChoicesSpy).not.toHaveBeenCalled();
//         });

//         it('should send results if gameState is DisplayQuizResults', () => {
//             gameSession.gameState = GameState.DisplayQuizResults;
//             const sortedPlayers = [
//                 { name: 'Player 1', score: 10, bonus: 5 },
//                 { name: 'Player 2', score: 15, bonus: 10 },
//             ];

//             const getOnlyGamePlayersMock = jest.fn(() => sortedPlayers as Player[]);
//             jest.spyOn(gameSession.room, 'getOnlyGamePlayers').mockImplementation(getOnlyGamePlayersMock);

//             const sortPlayersByScoreMock = jest.fn(() => sortedPlayers);
//             const sortPlayersByScoreAny = gameSession as any;
//             jest.spyOn(sortPlayersByScoreAny, 'sortPlayersByScore').mockImplementation(sortPlayersByScoreMock);

//             const broadcastPlayerResultsAny = gameSession as any;
//             const broadcastPlayerResultsSpy = jest.spyOn(broadcastPlayerResultsAny, 'broadcastPlayerResults');
//             const calculateCorrectChoicesMock = jest.fn(() => []);

//             const calculateCorrectChoicesAny = gameSession as any;
//             jest.spyOn(calculateCorrectChoicesAny, 'calculateCorrectChoices').mockImplementation(calculateCorrectChoicesMock);

//             gameSession.sendResultsToPlayers();

//             expect(sortPlayersByScoreMock).toHaveBeenCalled();
//             expect(broadcastPlayerResultsSpy).toHaveBeenCalledWith(
//                 [
//                     { name: 'Player 1', score: 10, bonus: 5 },
//                     { name: 'Player 2', score: 15, bonus: 10 },
//                 ],
//                 [],
//             );
//             expect(calculateCorrectChoicesMock).toHaveBeenCalled();
//         });
//     });

//     describe('endGame', () => {
//         it('should change game state to End', () => {
//             gameSession.gameState = GameState.PlayersAnswerQuestion;
//             const changeGameStateSpy = jest.spyOn(gameSession, 'changeGameState');
//             gameSession.endGame();
//             expect(changeGameStateSpy).toHaveBeenCalledWith(GameState.End);
//         });
//     });

//     describe('changeGameState', () => {
//         it('should change the game state and broadcast the event', () => {
//             const newState = GameState.PlayersAnswerQuestion;
//             // eslint-disable-next-line @typescript-eslint/no-shadow
//             const gameSession = new GameSession('game123', mockRoom as unknown as Room, quiz, GameType.Default, historyService);

//             gameSession.changeGameState(newState);

//             expect(gameSession.gameState).toBe(newState);
//             expect(mockRoom.broadcast).toHaveBeenCalledWith(GameEvents.GameStateChanged, {}, { gameState: newState });
//         });
//     });

//     describe('changeGameLockState', () => {
//         it('should change the game lock state and broadcast the event', () => {
//             // eslint-disable-next-line @typescript-eslint/no-shadow
//             const gameSession = new GameSession('game123', mockRoom as unknown as Room, quiz, GameType.Default, historyService);
//             gameSession.changeGameLockState();

//             expect(gameSession.isLocked).toBe(true);
//             expect(mockRoom.broadcast).toHaveBeenCalledWith(GameEvents.GameLockedStateChanged, {}, { isLocked: true });
//         });
//     });

//     describe('broadcastMessage', () => {
//         it('should broadcast a message to players', () => {
//             const messageContent = 'Hello players!';

//             // eslint-disable-next-line @typescript-eslint/no-shadow
//             const gameSession = new GameSession('game123', mockRoom as unknown as Room, quiz, GameType.Default, historyService);

//             gameSession.broadcastMessage(messageContent, mockPlayer as Player);

//             expect(mockRoom.broadcast).toHaveBeenCalledWith(
//                 GameEvents.PlayerSendMessage,
//                 {},
//                 expect.objectContaining({
//                     name: mockPlayer.name,
//                     content: messageContent,
//                     createdAt: expect.any(Date),
//                 }),
//             );
//         });
//     });

//     describe('toggleTimer', () => {
//         it('should toggle the timer play/pause if timer exists', () => {
//             gameSession.toggleTimer();
//             expect(timerMock.togglePlayPause).toHaveBeenCalled();
//         });

//         it('should not do anything if timer does not exist', () => {
//             gameSession.timer = null;
//             gameSession.toggleTimer();
//             expect(timerMock.togglePlayPause).not.toHaveBeenCalled();
//         });
//     });

//     describe('speedUpTimer', () => {
//         it('should speed up the timer if timer exists', () => {
//             gameSession.speedUpTimer();
//             expect(timerMock.speedUp).toHaveBeenCalled();
//         });

//         it('should not do anything if timer does not exist', () => {
//             gameSession.timer = null;
//             gameSession.speedUpTimer();
//             expect(timerMock.speedUp).not.toHaveBeenCalled();
//         });
//     });

//     describe('broadcastCorrectAnswers', () => {
//         it('should not broadcast correct answers for a non-QCM question', () => {
//             const mockQuestion: Question = {
//                 _id: '123',
//                 text: 'What is the capital of France?',
//                 points: 10,
//                 createdAt: new Date(),
//                 lastModification: new Date(),
//                 type: QuestionType.QRL,
//             };

//             // eslint-disable-next-line @typescript-eslint/no-shadow
//             const gameSession = new GameSession('game123', mockRoom as unknown as Room, quiz, GameType.Default, historyService);
//             gameSession['broadcastCorrectAnswers'](mockQuestion);

//             expect(mockRoom.broadcast).not.toHaveBeenCalled();
//         });

//         it('should broadcast correct answers for a QCM question', () => {
//             const mockQuestion: Question = {
//                 _id: '123',
//                 text: 'What is the capital of France?',
//                 points: 10,
//                 createdAt: new Date(),
//                 lastModification: new Date(),
//                 type: QuestionType.QCM,
//                 choices: [
//                     { _id: 1, text: 'Paris', isCorrect: true },
//                     { _id: 2, text: 'London', isCorrect: false },
//                     { _id: 3, text: 'Berlin', isCorrect: false },
//                     { _id: 4, text: 'Rome', isCorrect: true },
//                 ],
//             };

//             // eslint-disable-next-line @typescript-eslint/no-shadow
//             const gameSession = new GameSession('game123', mockRoom as unknown as Room, quiz, GameType.Default, historyService);

//             gameSession['broadcastCorrectAnswers'](mockQuestion);

//             expect(mockRoom.broadcast).toHaveBeenCalledWith(
//                 GameEvents.SendCorrectAnswers,
//                 {},
//                 {
//                     choices: [
//                         { _id: 1, text: 'Paris', isCorrect: true },
//                         { _id: 4, text: 'Rome', isCorrect: true },
//                     ],
//                 },
//             );
//         });
//     });
//     describe('sortPlayersAnswersByTime', () => {
//         const mockAnswer1: CompletePlayerAnswer = {
//             hasInterracted: true,
//             hasConfirmed: true,
//             hasConfirmedAt: new Date('2024-03-26T12:00:00Z'),
//             answer: 'Answer',
//         };

//         const mockAnswer2: CompletePlayerAnswer = {
//             hasInterracted: true,
//             hasConfirmed: true,
//             hasConfirmedAt: new Date('2023-03-25T12:00:00Z'),
//             answer: 'Answer',
//         };

//         const mockPlayer1: Player = {
//             name: 'Player1',
//             role: GameRole.Player,
//             socket: {} as any,
//             bonus: 0,
//             score: 10,
//             isExcluded: false,
//             hasGiveUp: false,
//             // @ts-ignore
//             room: mockRoom,
//             // @ts-ignore
//             game: gameSession,
//             // @ts-ignore
//             // eslint-disable-next-line @typescript-eslint/naming-convention
//             answers: { 1: { mockAnswer1 } },
//             setRoom: jest.fn(),
//             confirmAnswer: jest.fn(),
//             setAnswer: jest.fn(),
//             getAnswer: jest.fn(),
//             send: jest.fn(),
//             on: jest.fn(),
//             off: jest.fn(),
//             joinRoom: jest.fn(),
//             leaveRoom: jest.fn(),
//             leaveAllRooms: jest.fn(),
//         };

//         const mockPlayer2: Player = {
//             name: 'Player2',
//             role: GameRole.Player,
//             socket: {} as any,
//             bonus: 0,
//             score: 10,
//             isExcluded: false,
//             hasGiveUp: false,
//             // @ts-ignore
//             room: mockRoom,
//             // @ts-ignore
//             game: gameSession,
//             // @ts-ignore
//             // eslint-disable-next-line @typescript-eslint/naming-convention
//             answers: { 1: { mockAnswer2 } },
//             setRoom: jest.fn(),
//             confirmAnswer: jest.fn(),
//             setAnswer: jest.fn(),
//             getAnswer: jest.fn(),
//             send: jest.fn(),
//             on: jest.fn(),
//             off: jest.fn(),
//             joinRoom: jest.fn(),
//             leaveRoom: jest.fn(),
//             leaveAllRooms: jest.fn(),
//         };

//         it('should sort the players by time', () => {
//             const players: Player[] = [mockPlayer1, mockPlayer2];
//             gameSession.gameQuestionIndex = 1;
//             // @ts-ignore
//             const result = gameSession.sortPlayersAnswersByTime(players);
//             expect(result).toEqual([mockPlayer2, mockPlayer1]);
//         });
//     });

//     describe('sortPlayersByScore', () => {
//         const mockPlayer1: Player = {
//             name: 'Player1',
//             role: GameRole.Player,
//             socket: {} as any,
//             bonus: 0,
//             score: 10,
//             isExcluded: false,
//             hasGiveUp: false,
//             // @ts-ignore
//             room: mockRoom,
//             // @ts-ignore
//             game: gameSession,
//             // @ts-ignore
//             answers: [],
//             setRoom: jest.fn(),
//             confirmAnswer: jest.fn(),
//             setAnswer: jest.fn(),
//             getAnswer: jest.fn(),
//             send: jest.fn(),
//             on: jest.fn(),
//             off: jest.fn(),
//             joinRoom: jest.fn(),
//             leaveRoom: jest.fn(),
//             leaveAllRooms: jest.fn(),
//         };

//         const mockPlayer2: Player = {
//             name: 'Player2',
//             role: GameRole.Player,
//             socket: {} as any,
//             bonus: 0,
//             score: 12,
//             isExcluded: false,
//             hasGiveUp: false,
//             // @ts-ignore
//             room: mockRoom,
//             // @ts-ignore
//             game: gameSession,
//             // @ts-ignore
//             answers: [],
//             setRoom: jest.fn(),
//             confirmAnswer: jest.fn(),
//             setAnswer: jest.fn(),
//             getAnswer: jest.fn(),
//             send: jest.fn(),
//             on: jest.fn(),
//             off: jest.fn(),
//             joinRoom: jest.fn(),
//             leaveRoom: jest.fn(),
//             leaveAllRooms: jest.fn(),
//         };

//         const mockPlayer3: Player = {
//             name: 'Alayer3',
//             role: GameRole.Player,
//             socket: {} as any,
//             bonus: 0,
//             score: 10,
//             isExcluded: false,
//             hasGiveUp: false,
//             // @ts-ignore
//             room: mockRoom,
//             // @ts-ignore
//             game: gameSession,
//             // @ts-ignore
//             answers: [],
//             setRoom: jest.fn(),
//             confirmAnswer: jest.fn(),
//             setAnswer: jest.fn(),
//             getAnswer: jest.fn(),
//             send: jest.fn(),
//             on: jest.fn(),
//             off: jest.fn(),
//             joinRoom: jest.fn(),
//             leaveRoom: jest.fn(),
//             leaveAllRooms: jest.fn(),
//         };

//         it('should sort players by score', () => {
//             gameSession.gameQuestionIndex = 1;
//             const players: Player[] = [mockPlayer1, mockPlayer2];
//             // @ts-ignore
//             const result = gameSession.sortPlayersByScore(players);
//             expect(result).toEqual([mockPlayer2, mockPlayer1]);
//         });

//         it('should sort players by name if results is same', () => {
//             const players: Player[] = [mockPlayer1, mockPlayer3];
//             // @ts-ignore
//             const result = gameSession.sortPlayersByScore(players);
//             expect(result).toEqual([mockPlayer3, mockPlayer1]);
//         });
//     });

//     describe('simpleDelay', () => {});

//     describe('isCorrectAnswer', () => {
//         it('should return true for correct answers', () => {
//             const correctAnswers = [1, 3];
//             const playerAnswer = [1, 3];

//             // @ts-ignore
//             const result = gameSession.isCorrectAnswer(playerAnswer, correctAnswers);

//             expect(result).toBe(true);
//         });

//         it('should return false for incorrect answers', () => {
//             const correctAnswers = [1, 3];
//             const playerAnswer = [2, 2];

//             // @ts-ignore
//             const result = gameSession.isCorrectAnswer(playerAnswer, correctAnswers);

//             expect(result).toBe(false);
//         });
//     });
//     describe('getAmountOfPlayersWhoAnswered', () => {
//         const mockPlayer1: Partial<Player> = {
//             name: 'Player1',
//             role: GameRole.Player,
//             socket: {} as any,
//             bonus: 0,
//             score: 0,
//             isExcluded: false,
//             hasGiveUp: false,
//             getAnswer: jest.fn(() => ({
//                 hasInterracted: true,
//                 hasConfirmed: true,
//                 hasConfirmedAt: new Date(),
//                 answer: [0, 1],
//             })),
//         };

//         const mockPlayer2: Partial<Player> = {
//             name: 'Player2',
//             role: GameRole.Player,
//             socket: {} as any,
//             bonus: 0,
//             score: 0,
//             isExcluded: false,
//             hasGiveUp: false,
//             getAnswer: jest.fn(() => ({
//                 hasInterracted: true,
//                 hasConfirmed: true,
//                 hasConfirmedAt: new Date(),
//                 answer: [0, 1],
//             })),
//         };

//         const mockSetGame = jest.fn();

//         // eslint-disable-next-line @typescript-eslint/no-shadow
//         const mockRoom: Partial<Room> = {
//             getOnlyGamePlayers: jest.fn(() => [mockPlayer1 as Player, mockPlayer2 as Player]),
//             setGame: mockSetGame,
//         };

//         it('should correctly count players who answered each choice', () => {
//             // eslint-disable-next-line @typescript-eslint/no-shadow
//             const gameSession = new GameSession('test-code', mockRoom as unknown as Room, quiz, GameType.Default, historyService);
//             // @ts-ignore
//             const result = gameSession.getAmountOfPlayersWhoAnswered(2);
//             expect(result).toEqual([2, 2, 0, 0]);
//         });

//         it('should not change the array, if no players are choosed for answers', () => {
//             // @ts-ignore
//             const result = gameSession.getAmountOfPlayersWhoAnswered(0);
//             expect(result).toEqual([0, 0, 0, 0]);
//         });
//     });
// });
