/* eslint-disable max-lines */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { WORKING_QUIZ } from '@app/fake-quizzes';
import { ChatService } from '@app/services/chat/chat.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { SocketService } from '@app/services/socket/socket.service';
import { SoundService } from '@app/services/sound/sound.service';
import { GameEvents, InteractionStatus, PlayerClient } from '@common/game-types';
import { Choice, Game, GameRole, GameState, GameType, Question, QuestionType, Quiz } from '@common/types';
import { cloneDeep } from 'lodash';
import { of } from 'rxjs';
import { GameService } from './game.service';

const mockGame: Game = {
    _id: 'Mock Game',
    users: [],
    quiz: WORKING_QUIZ as Quiz,
    type: GameType.Default,
    isLocked: false,
    code: '8824',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockTestGame: Game = {
    _id: 'Mock Game',
    users: [],
    quiz: WORKING_QUIZ as Quiz,
    type: GameType.Test,
    isLocked: false,
    code: '8824',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
};

const mockPlayer: PlayerClient = {
    name: 'Sportek',
    role: GameRole.Player,
    score: 0,
    isExcluded: false,
    hasGiveUp: false,
    isMuted: false,
    interactionStatus: InteractionStatus.noInteraction,
};

const mockOrganisator = {
    name: 'Sportek',
    role: GameRole.Organisator,
    score: 0,
    isExcluded: false,
    hasGiveUp: false,
    isMuted: false,
    interactionStatus: InteractionStatus.noInteraction,
};

describe('GameService', () => {
    let service: GameService;
    let mockSnackbar: jasmine.SpyObj<MatSnackBar>;
    let mockSocketService: jasmine.SpyObj<SocketService>;
    let mockNotificationService: jasmine.SpyObj<NotificationService>;
    let mockChatService: jasmine.SpyObj<ChatService>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockHttpService: jasmine.SpyObj<HttpClient>;
    let soundServiceMocked: jasmine.SpyObj<SoundService>;

    beforeEach(() => {
        mockChatService = jasmine.createSpyObj(ChatService, ['initialize']);
        mockSocketService = jasmine.createSpyObj(SocketService, ['listen', 'send', 'connect']);
        mockNotificationService = jasmine.createSpyObj(NotificationService, ['error', 'success', 'info']);
        mockRouter = jasmine.createSpyObj(Router, ['navigateByUrl', 'navigate']);
        mockHttpService = jasmine.createSpyObj(HttpClient, ['post']);
        soundServiceMocked = jasmine.createSpyObj(SoundService, ['startPlayingSound']);

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: MatSnackBar, useValue: mockSnackbar },
                { provide: SocketService, useValue: mockSocketService },
                { provide: NotificationService, useValue: mockNotificationService },
                { provide: ChatService, useValue: mockChatService },
                { provide: Router, useValue: mockRouter },
                { provide: HttpClient, useValue: mockHttpService },
                { provide: SoundService, useValue: soundServiceMocked },
            ],
        });
        service = TestBed.inject(GameService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('startGame', () => {
        it('should return if game is locked', () => {
            service.isLocked.next(false);
            service.startGame();
            expect(mockNotificationService.error).toHaveBeenCalledWith('Veuillez verrouiller la partie avant de la démarrer');
            expect(mockSocketService.send).not.toHaveBeenCalled();
        });

        it("should return if there aren't enough players", () => {
            service.isLocked.next(true);
            service.players.next([]);
            service.startGame();
            expect(mockNotificationService.error).toHaveBeenCalledWith('Il doit y avoir au moins un joueur pour démarrer la partie');
            expect(mockSocketService.send).not.toHaveBeenCalled();
        });

        it('should start game', () => {
            service.isLocked.next(true);
            service.players.next([cloneDeep(mockPlayer)]);
            service.startGame();
            expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.StartGame);
        });
    });

    it('should lock game', () => {
        service.changeLockState();
        expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.ChangeLockedState);
    });

    it('should send answers', () => {
        service.sendAnswer('Fake Answer');
        expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.SelectAnswer, { answers: 'Fake Answer' });
    });

    describe('isLastQuestion', () => {
        it('should return false if no question', () => {
            service.actualQuestion.next(null);
            const result = service.isLastQuestion();
            expect(result).toBeFalse();
        });

        it('should return true if last question', () => {
            service.actualQuestion.next({ question: WORKING_QUIZ.questions[0] as Question, totalQuestion: 2, actualIndex: 1 });
            const result = service.isLastQuestion();
            expect(result).toBeTrue();
        });

        it('should return false if not last question', () => {
            service.actualQuestion.next({ question: WORKING_QUIZ.questions[0] as Question, totalQuestion: 3, actualIndex: 1 });
            const result = service.isLastQuestion();
            expect(result).toBeFalse();
        });
    });

    it('should confirm answers', () => {
        service.confirmAnswer();
        expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.ConfirmAnswers);
    });

    describe('filterPlayers', () => {
        it('should return empty array if no players', () => {
            service.players.next([]);
            const filteredPlayers = service.filterPlayers();
            expect(filteredPlayers).toEqual([]);
        });

        it('should return empty array if no player players', () => {
            service.players.next([mockOrganisator]);
            const filteredPlayers = service.filterPlayers();
            expect(filteredPlayers).toEqual([]);
        });

        it('should return player array if players', () => {
            service.players.next([cloneDeep(mockPlayer)]);
            const filteredPlayers = service.filterPlayers();
            expect(filteredPlayers).toEqual([cloneDeep(mockPlayer)]);
        });
    });

    it('should toggle timer', () => {
        service.toggleTimer();
        expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.ToggleTimer);
    });

    describe('speedUpTimer', () => {
        it('should send cooldown exceeded error', () => {
            service.actualQuestion.next({ question: WORKING_QUIZ.questions[0] as Question, totalQuestion: 3, actualIndex: 1 });
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            service.cooldown.next(9);
            service.speedUpTimer();
            expect(mockNotificationService.error).toHaveBeenCalledWith('Le temps requis minimum pour accélérer le timer est dépassé');
        });

        it('should return QCM time limit', () => {
            service.actualQuestion.next({ question: WORKING_QUIZ.questions[0] as Question, totalQuestion: 3, actualIndex: 1 });
            // @ts-ignore
            const result = service.getRequiredTime();
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            expect(result).toEqual(10);
        });

        it('should return QCM time limit', () => {
            // @ts-ignore
            const result = service.getRequiredTime();
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            expect(result).toEqual(20);
        });

        it('should speed up timer', () => {
            service.actualQuestion.next({ question: WORKING_QUIZ.questions[0] as Question, totalQuestion: 3, actualIndex: 1 });
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            service.cooldown.next(12);
            service.speedUpTimer();
            expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.SpeedUpTimer);
        });
    });

    it('should navigate home', () => {
        service.giveUp();
        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/home', { replaceUrl: true });
    });

    describe('createNewGame', () => {
        it('should create the game', () => {
            mockHttpService.post.and.returnValue(of(mockGame));
            const initialiseSpy = spyOn(service, 'initialise');
            service.createNewGame('FakeId', GameType.Default);

            expect(initialiseSpy).toHaveBeenCalled();
            expect(mockSocketService.connect).toHaveBeenCalled();
            expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.CreateGame, {
                code: mockGame.code,
                quizId: 'FakeId',
                gameType: mockGame.type,
            });

            const game = service.game.getValue();
            expect(game).toEqual({ code: mockGame.code, quizName: mockGame.quiz.title, type: mockGame.type });
        });

        it('should send to waiting room', () => {
            mockHttpService.post.and.returnValue(of(mockGame));
            service.createNewGame('FakeId', GameType.Default);
            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/waiting-room/' + mockGame.code);
            expect(service.client.getValue()).toEqual({ name: 'Organisateur', role: GameRole.Organisator, score: 0 });
        });

        it('should test game', () => {
            mockHttpService.post.and.returnValue(of(mockTestGame));
            const changeLockStateSpy = spyOn(service, 'changeLockState');
            const startGameSpy = spyOn(service, 'startGame');

            service.createNewGame('FakeId', GameType.Test);

            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/game/' + mockTestGame.code);
            expect(service.client.getValue()).toEqual({ name: 'Organisateur', role: GameRole.Player, score: 0 });
            expect(changeLockStateSpy).toHaveBeenCalled();
            expect(service.isLocked.getValue()).toBeTrue();
            expect(service.players.getValue()).toEqual([
                {
                    name: 'Organisateur',
                    role: GameRole.Player,
                    isExcluded: false,
                    score: 0,
                    hasGiveUp: false,
                    isMuted: false,
                    interactionStatus: InteractionStatus.noInteraction,
                },
            ]);
            expect(startGameSpy).toHaveBeenCalled();
        });

        it('should do nothing', () => {
            mockHttpService.post.and.returnValue(of(mockTestGame));
            // @ts-ignore
            const createDefaultGameSpy = spyOn(service, 'createDefaultGame');
            // @ts-ignore
            const createTestGameSpy = spyOn(service, 'createTestGame');

            service.createNewGame('fakeId', GameType.Random);
            expect(createDefaultGameSpy).not.toHaveBeenCalled();
            expect(createTestGameSpy).not.toHaveBeenCalled();
        });
    });

    describe('nextQuestion', () => {
        it('go next question if possible', () => {
            service.cooldown.next(0);
            service.gameState.next(GameState.DisplayQuestionResults);
            service.nextQuestion();
            expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.NextQuestion);
        });
    });

    describe('selectAnswer', () => {
        it('should return if is final answer', () => {
            const sendAnswerSpy = spyOn(service, 'sendAnswer');
            service.isFinalAnswer.next(true);
            service.selectAnswer(0);
            expect(sendAnswerSpy).not.toHaveBeenCalled();
        });

        it('should remove answer if already in list', () => {
            const sendAnswerSpy = spyOn(service, 'sendAnswer');
            service.answer.next([0, 1, 2]);
            service.selectAnswer(0);
            expect(sendAnswerSpy).toHaveBeenCalledWith([1, 2]);
        });

        it('should add answer if not in list', () => {
            const sendAnswerSpy = spyOn(service, 'sendAnswer');
            service.answer.next([1, 2]);
            service.selectAnswer(0);
            expect(sendAnswerSpy).toHaveBeenCalledWith([1, 2, 0]);
        });
    });

    describe('setResponseAsFinal', () => {
        it('should return if is final answer', () => {
            const confirmAnswerSpy = spyOn(service, 'confirmAnswer');
            service.isFinalAnswer.next(true);
            service.setResponseAsFinal();
            expect(confirmAnswerSpy).not.toHaveBeenCalled();
        });

        it('should give error if no answer selected', () => {
            service.actualQuestion.next({ question: WORKING_QUIZ.questions[0] as Question, totalQuestion: 3, actualIndex: 1 });
            service.isFinalAnswer.next(false);
            service.answer.next([]);
            service.setResponseAsFinal();
            expect(mockNotificationService.error).toHaveBeenCalled();
        });

        it('should set answer as final', () => {
            const confirmAnswerSpy = spyOn(service, 'confirmAnswer');
            service.isFinalAnswer.next(false);
            service.answer.next([0]);
            service.setResponseAsFinal();
            expect(service.isFinalAnswer.getValue()).toBeTrue();
            expect(confirmAnswerSpy).toHaveBeenCalled();
        });
    });

    it('should ban player', () => {
        service.banPlayer(cloneDeep(mockPlayer));
        expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.BanPlayer, { name: 'Sportek' });
    });

    it('should return correct answers', () => {
        spyOn(service['correctAnswers'], 'asObservable').and.returnValue(of(WORKING_QUIZ.questions[0].choices as Choice[]));

        let result: Choice[] = [];
        service.getCorrectAnswers().subscribe((answers) => {
            result = answers;
        });

        expect(result).toEqual(WORKING_QUIZ.questions[0].choices as Choice[]);
    });

    describe('handleError', () => {
        it('should catch 404 error', () => {
            let thrownError = new Error();
            // @ts-ignore
            service.handleError({ status: 404 }).subscribe({
                error: (caughtError) => {
                    thrownError = caughtError;
                },
            });
            expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/error-404', { replaceUrl: true });
            expect(thrownError.message).toEqual('Impossible to find this game');
        });

        it('should catch other errors', () => {
            let thrownError = new Error();
            // @ts-ignore
            service.handleError({ status: 500, message: 'allo' }).subscribe({
                error: (caughtError) => {
                    thrownError = caughtError;
                },
            });
            expect(thrownError.message).toEqual('allo');
        });
    });

    it('should reset player answers', () => {
        service.players.next([
            {
                name: 'Sportek',
                role: GameRole.Player,
                score: 0,
                isExcluded: false,
                hasGiveUp: false,
                answers: { hasInterracted: true, hasConfirmed: true, answer: [0] },
                isMuted: false,
                interactionStatus: InteractionStatus.noInteraction,
            },
        ]);
        service.actualQuestion.next({ question: WORKING_QUIZ.questions[0] as Question, actualIndex: 1, totalQuestion: 2 });
        // @ts-ignore
        service.gameEventsListener.resetPlayerAnswers();
        expect(service.players.getValue()).toEqual([
            {
                name: 'Sportek',
                role: GameRole.Player,
                score: 0,
                isExcluded: false,
                hasGiveUp: false,
                answers: { hasInterracted: false, hasConfirmed: false, answer: [] },
                isMuted: false,
                interactionStatus: InteractionStatus.noInteraction,
            },
        ]);
    });

    it('should add player to game', () => {
        service.players.next([]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback(cloneDeep(mockPlayer));
        });

        // @ts-ignore
        service.gameEventsListener.playerJoinGameListener();

        expect(service.players.getValue()).toEqual([cloneDeep(mockPlayer)]);
    });

    it('should remove player from game', () => {
        service.players.next([cloneDeep(mockPlayer)]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback({ name: 'Sportek' });
        });

        // @ts-ignore
        service.gameEventsListener.playerQuitGameListener();

        expect(service.players.getValue()).toEqual([]);
    });

    it('should update cooldown', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        service.cooldown.next(10);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback({ cooldown: 5 });
        });

        // @ts-ignore
        service.gameEventsListener.gameCooldownListener();

        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(service.cooldown.getValue()).toEqual(5);
    });

    it('should close game', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback(null);
        });

        // @ts-ignore
        service.gameEventsListener.gameClosedListener();

        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/home', { replaceUrl: true });
        expect(mockNotificationService.success).toHaveBeenCalledWith('La partie a été fermée');
    });

    describe('changeGameStateListener', () => {
        it('should change game state', () => {
            service.gameState.next(GameState.DisplayQuizResults);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
                callback({ gameState: GameState.WaitingPlayers });
            });

            // @ts-ignore
            service.gameEventsListener.gameChangeStateListener();

            expect(service.gameState.getValue()).toEqual(GameState.WaitingPlayers);
        });

        it('should allow players to answer questions and navigate to organiser view', () => {
            service.gameState.next(GameState.WaitingPlayers);
            service.client.next(mockOrganisator);
            service.game.next({ code: mockGame.code, quizName: 'Quiz Test', type: mockGame.type });

            // @ts-ignore
            const resetPlayerAnswersSpy = spyOn(service.gameEventsListener, 'resetPlayerAnswers');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
                callback({ gameState: GameState.PlayersAnswerQuestion });
            });

            // @ts-ignore
            service.gameEventsListener.gameChangeStateListener();

            expect(service.gameState.getValue()).toEqual(GameState.PlayersAnswerQuestion);
            expect(resetPlayerAnswersSpy).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/organisator', mockGame.code], { replaceUrl: true });
        });

        it('should allow players to answer questions and navigate to player view', () => {
            service.gameState.next(GameState.WaitingPlayers);
            service.client.next(cloneDeep(mockPlayer));
            service.game.next({ code: mockGame.code, quizName: 'Quiz Test', type: mockGame.type });

            // @ts-ignore
            const resetPlayerAnswersSpy = spyOn(service.gameEventsListener, 'resetPlayerAnswers');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
                callback({ gameState: GameState.PlayersAnswerQuestion });
            });

            // @ts-ignore
            service.gameEventsListener.gameChangeStateListener();

            expect(service.gameState.getValue()).toEqual(GameState.PlayersAnswerQuestion);
            expect(resetPlayerAnswersSpy).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/game', mockGame.code], { replaceUrl: true });
        });

        it('should set final answer to true', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
                callback({ gameState: GameState.DisplayQuestionResults });
            });

            // @ts-ignore
            service.gameEventsListener.gameChangeStateListener();

            expect(service.gameState.getValue()).toEqual(GameState.DisplayQuestionResults);
            expect(service.isFinalAnswer.getValue()).toBeTrue();
        });

        it('should not show results if game type was test', () => {
            service.game.next({ code: mockTestGame.code, quizName: 'Quiz Test', type: mockTestGame.type });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
                callback({ gameState: GameState.DisplayQuizResults });
            });

            // @ts-ignore
            service.gameEventsListener.gameChangeStateListener();

            expect(service.gameState.getValue()).toEqual(GameState.DisplayQuizResults);
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/create/'], { replaceUrl: true });
        });

        it('should show results if game type is default', () => {
            service.game.next({ code: mockGame.code, quizName: 'Quiz Test', type: mockGame.type });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
                callback({ gameState: GameState.DisplayQuizResults });
            });

            // @ts-ignore
            service.gameEventsListener.gameChangeStateListener();

            expect(service.gameState.getValue()).toEqual(GameState.DisplayQuizResults);
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/results', mockGame.code], { replaceUrl: true });
        });
    });

    it('should receive game results', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback({
                scores: [{ name: 'Sportek', score: 12, bonus: 1 }],
                choices: [[{ text: 'choice1', amount: 1, isCorrect: true }]],
                questions: [WORKING_QUIZ.questions[0] as Question],
            });
        });

        // @ts-ignore
        service.gameEventsListener.playerSendResultsListener();
        expect(service.answers.getValue()).toEqual({
            scores: [{ name: 'Sportek', score: 12, bonus: 1 }],
            choices: [[{ text: 'choice1', amount: 1, isCorrect: true }]],
            questions: [WORKING_QUIZ.questions[0] as Question],
        });
    });

    it('should assign scores to players', () => {
        service.players.next([cloneDeep(mockPlayer)]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback({ scores: [{ name: 'Sportek', score: 12 }] });
        });

        // @ts-ignore
        service.gameEventsListener.sendPlayerScoresListener();

        expect(service.players.getValue()).toEqual([
            {
                name: 'Sportek',
                role: GameRole.Player,
                score: 12,
                isExcluded: false,
                hasGiveUp: false,
                isMuted: false,
                interactionStatus: InteractionStatus.noInteraction,
            },
        ]);
    });

    it('should update game question', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback({ actualQuestion: { question: WORKING_QUIZ.questions[0] as Question, totalQuestion: 2, actualIndex: 1 } });
        });

        // @ts-ignore
        service.gameEventsListener.gameQuestionListener();

        expect(service.actualQuestion.getValue()).toEqual({ question: WORKING_QUIZ.questions[0] as Question, totalQuestion: 2, actualIndex: 1 });
        expect(service.answer.getValue()).toEqual([]);
        expect(service.isFinalAnswer.getValue()).toBeFalse();
    });

    it('should receive answers', () => {
        service.players.next([cloneDeep(mockPlayer)]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback({ name: 'Sportek', answer: [0] });
        });

        // @ts-ignore
        service.gameEventsListener.receiveAnswerListener();

        expect(service.players.getValue()[0].answers).toEqual({ hasInterracted: true, hasConfirmed: false, answer: [0] });
    });

    it('should receive correct choices', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback({ choices: WORKING_QUIZ.questions[0].choices as Choice[] });
        });

        // @ts-ignore
        service.gameEventsListener.receiveCorrectAnswersListener();

        expect(service.correctAnswers.getValue()).toEqual(WORKING_QUIZ.questions[0].choices as Choice[]);
    });

    it("should confirm player's answers", () => {
        service.players.next([
            {
                name: 'Sportek',
                role: GameRole.Player,
                score: 0,
                isExcluded: false,
                hasGiveUp: false,
                answers: { hasInterracted: false, hasConfirmed: false, answer: [0] },
                isMuted: false,
                interactionStatus: InteractionStatus.noInteraction,
            },
        ]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback({ name: 'Sportek' });
        });

        // @ts-ignore
        service.gameEventsListener.receiveConfirmAnswerListener();

        expect(service.players.getValue()[0].answers).toEqual({ hasInterracted: false, hasConfirmed: true, answer: [0] });
    });

    it("shouldn't confirm answers for no players", () => {
        service.players.next([cloneDeep(mockPlayer)]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback({ name: 'Sportek' });
        });

        // @ts-ignore
        service.gameEventsListener.receiveConfirmAnswerListener();

        expect(service.players.getValue()[0].answers).toBeUndefined();
    });

    it('should give bonus to first correct answer', () => {
        service.client.next(cloneDeep(mockPlayer));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback({ score: 12, hasAnsweredFirst: true });
        });

        // @ts-ignore
        service.gameEventsListener.receiveUpdateScoreListener();

        expect(mockNotificationService.info).toHaveBeenCalledWith('Vous avez répondu en premier et gagnez 12 points !');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(service.client.getValue().score).toEqual(12);
    });

    it('should change locked state', () => {
        service.isLocked.next(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback({ isLocked: true });
        });

        // @ts-ignore
        service.gameEventsListener.receiveGameLockedStateChanged();

        expect(service.isLocked.getValue()).toBeTrue();
    });

    it('should receive banned players', () => {
        service.client.next(cloneDeep(mockPlayer));
        service.players.next([cloneDeep(mockPlayer)]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback({ name: 'Sportek' });
        });

        // @ts-ignore
        service.gameEventsListener.receiveBannedPlayers();

        expect(service.players.getValue()).toEqual([
            {
                name: 'Sportek',
                role: GameRole.Player,
                score: 0,
                isExcluded: true,
                hasGiveUp: false,
                isMuted: false,
                interactionStatus: InteractionStatus.noInteraction,
            },
        ]);
        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/home', { replaceUrl: true });
        expect(mockNotificationService.error).toHaveBeenCalledWith('Vous avez été banni de la partie');
    });

    it('should receive players that have given up', () => {
        service.client.next(cloneDeep(mockPlayer));
        service.players.next([cloneDeep(mockPlayer)]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback({ name: 'Sportek' });
        });

        // @ts-ignore
        service.gameEventsListener.receiveGiveUpPlayers();

        expect(service.players.getValue()).toEqual([
            {
                name: 'Sportek',
                role: GameRole.Player,
                score: 0,
                isExcluded: false,
                hasGiveUp: true,
                isMuted: false,
                interactionStatus: InteractionStatus.abandoned,
            },
        ]);
    });

    //       private receiveUpdateScoreListener() {
    //     this.gameService.socketService.listen(GameEvents.UpdateScore, (data: GameEventsData.UpdateScore) => {
    //         const pointsEarned = data.score - this.gameService.client.getValue().score;
    //         if (this.gameService.client.getValue().role === GameRole.Player) {
    //             if (pointsEarned > 0) {
    //                 if (data.hasAnsweredFirst)
    //                     this.gameService.notificationService.info(`Vous avez répondu en premier et gagnez ${pointsEarned} points !`);
    //                 else this.gameService.notificationService.info(`Vous avez gagné ${pointsEarned} points !`);
    //             }
    //         }
    //         this.gameService.client.next({ ...this.gameService.client.getValue(), score: data.score });
    //     });
    // }

    it('should receive points earned', () => {
        service.client.next(cloneDeep(mockPlayer));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback({ score: 12, hasAnsweredFirst: false });
        });

        // @ts-ignore
        service.gameEventsListener.receiveUpdateScoreListener();

        expect(mockNotificationService.info).toHaveBeenCalledWith('Vous avez gagné 12 points !');
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        expect(service.client.getValue().score).toEqual(12);
    });

    it('should not have right to write messages', () => {
        service.client.next(cloneDeep(mockPlayer));
        service.players.next([cloneDeep(mockPlayer)]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback({ name: 'Sportek', isMuted: true });
        });

        // @ts-ignore
        service.gameEventsListener.receiveMutedPlayers();

        expect(service.players.getValue()).toEqual([
            {
                name: 'Sportek',
                role: GameRole.Player,
                score: 0,
                isExcluded: false,
                hasGiveUp: false,
                isMuted: true,
                interactionStatus: InteractionStatus.noInteraction,
            },
        ]);
        expect(mockNotificationService.error).toHaveBeenCalledWith("Vous n'avez pas droit de clavarder");
    });

    it('should have right to write messages', () => {
        service.client.next(cloneDeep(mockPlayer));
        service.players.next([cloneDeep(mockPlayer)]);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback({ name: 'Sportek', isMuted: false });
        });

        // @ts-ignore
        service.gameEventsListener.receiveMutedPlayers();

        expect(service.players.getValue()).toEqual([
            {
                name: 'Sportek',
                role: GameRole.Player,
                score: 0,
                isExcluded: false,
                hasGiveUp: false,
                isMuted: false,
                interactionStatus: InteractionStatus.noInteraction,
            },
        ]);

        expect(mockNotificationService.success).toHaveBeenCalledWith('Vous avez le droit de clavarder a nouveau');
    });

    it(' should speed up timer', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mockSocketService.listen.and.callFake((eventName, callback: (data: any) => void) => {
            callback(null);
        });

        // @ts-ignore
        service.gameEventsListener.receiveSpeedUpTimer();

        expect(soundServiceMocked.startPlayingSound).toHaveBeenCalled();
    });
    it('should add answer index if not already selected', () => {
        service.answer.next([1, 2]);
        service.selectAnswer(3);
        expect(service.answer.getValue()).toEqual([1, 2, 3]);
    });

    it('should remove answer index if already selected', () => {
        service.answer.next([1, 2, 3]);
        service.selectAnswer(2);
        expect(service.answer.getValue()).toEqual([1, 3]);
    });

    it('should not modify answer if isFinalAnswer is true', () => {
        service.isFinalAnswer.next(true);
        service.answer.next([1, 2]);
        service.selectAnswer(3);
        expect(service.answer.getValue()).toEqual([1, 2]);
    });

    it('should set player as answered and update answer value for QRL', () => {
        const mockPlayers = [cloneDeep(mockPlayer)];
        service.players.next(mockPlayers);
        service.client.next(cloneDeep(mockPlayer));

        service.modifyAnswerQRL('Test answer');

        const updatedPlayer = mockPlayers[0];
        expect(updatedPlayer.answers?.hasInterracted).toBeUndefined();
        expect(service.answer.getValue()).toBe('Test answer');
        expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.SelectAnswer, { answers: 'Test answer' });
    });

    it('should update answer value and send answer for QCM', () => {
        service.enterAnswer('Test answer');

        expect(service.answer.getValue()).toBe('Test answer');
        expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.SelectAnswer, { answers: 'Test answer' });
    });

    it('should not update answer if isFinalAnswer is true', () => {
        service.isFinalAnswer.next(true);
        service.enterAnswer('Test answer');

        expect(service.answer.getValue()).toBeNull();
        expect(mockSocketService.send).not.toHaveBeenCalled();
    });

    it('should send RateAnswerQRL event with correct player name and score', () => {
        const mockPlayers = [
            cloneDeep(mockPlayer),
            {
                name: 'Player2',
                role: GameRole.Player,
                score: 0,
                isExcluded: false,
                hasGiveUp: false,
                isMuted: false,
                interactionStatus: InteractionStatus.noInteraction,
            },
        ];
        service.players.next(mockPlayers);

        service.rateAnswerQRL('Player2', 5);

        expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.RateAnswerQRL, { playerName: 'Player2', score: 5 });
    });

    it('should not send event if player not found', () => {
        service.rateAnswerQRL('NonExistentPlayer', 5);
        expect(mockSocketService.send).not.toHaveBeenCalled();
    });

    it('should set isFinalAnswer to true and call confirmAnswer for QCM with answer', () => {
        service.actualQuestion.next({ question: WORKING_QUIZ.questions[0] as Question, totalQuestion: 3, actualIndex: 1 });
        service.answer.next([1, 2]);

        service.setResponseAsFinal();

        expect(service.isFinalAnswer.getValue()).toBeTrue();
        expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.ConfirmAnswers);
    });

    it('should show error and not confirm for QCM without answer', () => {
        service.actualQuestion.next({ question: WORKING_QUIZ.questions[0] as Question, totalQuestion: 3, actualIndex: 1 });
        service.answer.next([]);

        service.setResponseAsFinal();

        expect(mockNotificationService.error).toHaveBeenCalledWith('Veuillez sélectionner au moins une réponse');
        expect(service.isFinalAnswer.getValue()).toBeFalse();
        expect(mockSocketService.send).not.toHaveBeenCalled();
    });

    it('should show error and not confirm for QRL with empty answer', () => {
        service.actualQuestion.next({
            question: { ...WORKING_QUIZ.questions[0], type: QuestionType.QRL } as unknown as Question,
            totalQuestion: 3,
            actualIndex: 1,
        });
        service.answer.next('');

        service.setResponseAsFinal();

        expect(mockNotificationService.error).toHaveBeenCalledWith('Veuillez entrer une réponse');
        expect(service.isFinalAnswer.getValue()).toBeFalse();
        expect(mockSocketService.send).not.toHaveBeenCalled();
    });

    it('should show error and not confirm for QRL with too long answer', () => {
        service.actualQuestion.next({
            question: { ...WORKING_QUIZ.questions[0], type: QuestionType.QRL } as unknown as Question,
            totalQuestion: 3,
            actualIndex: 1,
        });
        service.answer.next('a'.repeat(201));

        service.setResponseAsFinal();

        expect(mockNotificationService.error).toHaveBeenCalledWith('Le texte doit faire moins de 200 caractères');
        expect(service.isFinalAnswer.getValue()).toBeFalse();
        expect(mockSocketService.send).not.toHaveBeenCalled();
    });

    it('should send BanPlayer event with correct player name', () => {
        service.banPlayer(cloneDeep(mockPlayer));
        expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.BanPlayer, { name: mockPlayer.name });
    });

    it('should send MutePlayer event with correct player name', () => {
        service.toggleMutePlayer(cloneDeep(mockPlayer));
        expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.MutePlayer, { name: mockPlayer.name });
    });
    it('should return observable of correctAnswers', () => {
        const mockChoices: Choice[] = [
            { _id: 1, text: 'Choice 1', isCorrect: true },
            { _id: 2, text: 'Choice 2', isCorrect: false },
        ];
        service.correctAnswers.next(mockChoices);

        service.getCorrectAnswers().subscribe((choices) => {
            expect(choices).toEqual(mockChoices);
        });
    });

    it('should not modify players if player is undefined', () => {
        const initialPlayers = [cloneDeep(mockPlayer)];
        service.players.next(initialPlayers);
        // @ts-ignore
        service.setPlayerHasAnswered(undefined);

        expect(service.players.getValue()).toEqual(initialPlayers);
    });

    it('should navigate to waiting room and set client as organizer for default game', () => {
        // @ts-ignore
        service.createDefaultGame(mockGame);

        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/waiting-room/' + mockGame.code);
        expect(service.client.getValue()).toEqual({ name: 'Organisateur', role: GameRole.Organisator, score: 0 });
    });
    it('should navigate to waiting room and set client as organizer for random game', () => {
        // @ts-ignore
        service.createRandomGame(mockGame);

        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/waiting-room/' + mockGame.code);
        expect(service.client.getValue()).toEqual({ name: 'Organisateur', role: GameRole.Organisator, score: 0 });
    });
    it('should navigate to game, lock game, set client as player and start game for test game', () => {
        // @ts-ignore
        service.createTestGame(mockTestGame);

        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/game/' + mockTestGame.code);
        expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.ChangeLockedState);
        expect(service.isLocked.getValue()).toBeTrue();
        expect(service.client.getValue()).toEqual({ name: 'Organisateur', role: GameRole.Player, score: 0 });
        expect(service.players.getValue()).toEqual([
            {
                name: 'Organisateur',
                role: GameRole.Player,
                isExcluded: false,
                score: 0,
                hasGiveUp: false,
                isMuted: false,
                interactionStatus: InteractionStatus.noInteraction,
            },
        ]);
        expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.StartGame);
    });

    it('should navigate to error page if 404 error', () => {
        const error = { status: 404 } as HttpErrorResponse;
        // @ts-ignore
        service.handleError(error);

        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/error-404', { replaceUrl: true });
    });
    it('should set client as player and send start game event if game type is random', () => {
        service.isLocked.next(true);
        service.game.next({ ...mockGame, type: GameType.Random, quizName: 'Mock Quiz' });
        service.startGame();
        expect(service.client.getValue().role).toEqual(GameRole.Player);
        expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.StartGame);
        expect(service.startTime.getValue()).toBeTruthy();
    });
    it('should navigate to /create if game type is Test', () => {
        service.game.next({ ...mockGame, type: GameType.Test, quizName: 'Mock Quiz' });
        service.giveUp();
        expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/create', { replaceUrl: true });
    });
    it('should do nothing for unknown game type', () => {
        const game = { ...mockGame, type: GameType.Default };
        mockHttpService.post.and.returnValue(of(game));
        // @ts-ignore
        spyOn(service, 'createDefaultGame');
        // @ts-ignore
        spyOn(service, 'createTestGame');
        // @ts-ignore
        spyOn(service, 'createRandomGame');

        service.createNewGame('dummyQuizId', 'Unknown' as GameType);
        // @ts-ignore
        expect(service.createDefaultGame).not.toHaveBeenCalled();
        // @ts-ignore
        expect(service.createTestGame).not.toHaveBeenCalled();
        // @ts-ignore
        expect(service.createRandomGame).not.toHaveBeenCalled();
    });
});
