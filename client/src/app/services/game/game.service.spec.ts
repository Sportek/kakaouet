/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';

import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { QuizService } from '@app/services/quiz/quiz.service';
import { TimeService } from '@app/services/timer/time.service';
import { Game, GameState, GameType, Question, QuestionFeedback, QuestionType, Quiz } from '@common/types';
import { of } from 'rxjs';
import { GameService } from './game.service';

const INCREMENTE_SCORE = 1.2;

describe('GameService', () => {
    let service: GameService;
    let quizService: jasmine.SpyObj<QuizService>;
    let timeService: jasmine.SpyObj<TimeService>;

    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        const quizServiceSpy = jasmine.createSpyObj('QuizService', ['getQuizById', 'correctQuizAnswers']);

        const timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimer']);
        routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                GameService,
                { provide: QuizService, useValue: quizServiceSpy },
                { provide: TimeService, useValue: timeServiceSpy },
                {
                    provide: Router,
                    useValue: {
                        url: '/testing',
                        navigateByUrl: routerSpy.navigateByUrl,
                    },
                },
            ],
        });
        service = TestBed.inject(GameService);
        quizService = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
        timeService = TestBed.inject(TimeService) as jasmine.SpyObj<TimeService>;

        const quiz = {
            _id: 'quizId',
            createdAt: new Date(),
            lastModification: new Date(),
            visibility: true,
            description: 'quizDescription',
            duration: 10,
            name: 'quizName',
            questions: [
                {
                    _id: 'questionId',
                    label: 'questionLabel',
                    points: 1,
                    type: QuestionType.QCM,
                    choices: [{ _id: 0, label: 'choiceLabel', isCorrect: true }],
                    createdAt: new Date(),
                    lastModification: new Date(),
                },
                {
                    _id: 'questionId2',
                    label: 'questionLabel2',
                    points: 1,
                    type: QuestionType.QCM,
                    choices: [{ _id: 1, label: 'choiceLabel2', isCorrect: true }],
                    createdAt: new Date(),
                    lastModification: new Date(),
                },
            ],
        };

        service.game = {
            _id: 'gameId',
            code: 'gameCode',
            createdAt: new Date(),
            isLocked: false,
            messages: [],
            quiz,
            updatedAt: new Date(),
            type: GameType.Test,
            users: [],
        };

        quizServiceSpy.getQuizById.and.returnValue(of(quiz));
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should correctly initialize the game with given id', async () => {
        await service.init('someId');
        expect(service.id).toBe('someId');
    });

    it('should set the next question correctly', () => {
        const result = service.nextQuestion(1);
        expect(result).toBeTrue();

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(service.actualQuestion.value).toEqual(service.game!.quiz.questions[1]);
    });

    it('should reset the game state correctly', () => {
        service.resetGame();
        expect(service.game).toBeUndefined();
        expect(service.id).toBeNull();
        expect(service.gameState).toEqual(GameState.WaitingPlayers);
        expect(service.actualQuestion.value).toEqual({} as Question);
        expect(service.timer).toBeUndefined();
        expect(service.user.score).toEqual(0);
    });

    it('should select a choice correctly when canChangeChoices is true', () => {
        service.canChangeChoices = true;
        service.selectChoice(1);
        expect(service.selectedChoices.includes(1)).toBeTrue();

        // Test pour la déselection d'un choix déjà sélectionné
        service.selectChoice(1);
        expect(service.selectedChoices.includes(1)).toBeFalse();
    });

    it('should navigate to the description page on give up', () => {
        service.id = 'testId';
        service.giveUp();
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/create/description/testId');
    });

    it('should set gameState correctly and call respective methods', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const playersAnswerQuestionSpy = spyOn<any>(service, 'playersAnswerQuestion');
        service.executeState(GameState.PlayersAnswerQuestion);
        expect(service.gameState).toEqual(GameState.PlayersAnswerQuestion);
        expect(playersAnswerQuestionSpy).toHaveBeenCalled();
    });

    it('should add a message to the game', () => {
        const initialMessagesLength = service.game?.messages.length || 0;
        service.sendMessage('Test message');
        expect(service.game?.messages.length).toBe(initialMessagesLength + 1);
        expect(service.game?.messages[initialMessagesLength]?.content).toEqual('Test message');
    });

    it('should setup a fake game correctly', async () => {
        quizService.getQuizById.and.returnValue(
            of({
                _id: 'fakeQuizId',
                questions: [],
                createdAt: new Date(),
                lastModification: new Date(),
                visibility: true,
                description: 'fakeQuizDescription',
                duration: 10,
                name: 'fakeQuizName',
            } as Quiz),
        );
        await service.setupFakeGame('fakeQuizId');
        expect(service.game).toBeDefined();
        // eslint-disable-next-line no-underscore-dangle
        expect(service.game?.quiz._id).toEqual('fakeQuizId');
        expect(quizService.getQuizById).toHaveBeenCalledWith('fakeQuizId');
    });

    it('should correctly update correct answers and user score', async () => {
        const correctAnswersIndices = [0, 2];
        const points = 5;
        quizService.correctQuizAnswers.and.returnValue(
            of({
                correctChoicesIndices: correctAnswersIndices,
                points,
            } as QuestionFeedback),
        );

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        service.game = { ...service.game, quiz: { ...service!.game!.quiz, _id: 'quizId' } } as Game;
        service.actualQuestionIndex = 0;
        service.selectedChoices = [0];

        // @ts-ignore -- Accéder à une méthode privée
        await service.correctAnswers();

        expect(service.answers.value).toEqual(correctAnswersIndices);
        expect(service.user.score).toEqual(points * INCREMENTE_SCORE);
    });

    it('should call correctAnswers for a Test game type and start a cooldown timer', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const correctAnswersSpy = spyOn<any>(service, 'correctAnswers').and.resolveTo();
        // const createTimerSpy = spyOn(timeService, 'createTimer').and.callThrough();

        service.game = { ...service.game, type: GameType.Test } as Game; // S'assurer que le type de jeu est Test
        // @ts-ignore -- Accéder à une méthode privée
        service.displayQuestionResults();

        expect(correctAnswersSpy).toHaveBeenCalled();
        expect(timeService.createTimer).toHaveBeenCalled();
    });

    it('should call setupFakeGame if URL contains "testing" and id is provided', async () => {
        const testId = '123'; // ID de test valide
        const setupFakeGameSpy = spyOn(service, 'setupFakeGame').and.resolveTo();
        await service.init(testId);

        expect(setupFakeGameSpy).toHaveBeenCalledWith(testId);
    });

    it('should return true if the choice is selected', () => {
        // Simuler une sélection de choix
        service.selectedChoices = [1, 2, 3];

        expect(service.isSelected(1)).toBeTrue();
        expect(service.isSelected(2)).toBeTrue();
    });

    it('should return false if the choice is not selected', () => {
        // Simuler une sélection de choix
        service.selectedChoices = [1, 2, 3];

        expect(service.isSelected(4)).toBeFalse();
    });

    it('should return an Observable of correct answers indices', (done) => {
        // Simuler les réponses correctes
        service.answers.next([0, 2]);

        service.getCorrectAnswers().subscribe((answers) => {
            expect(answers).toEqual([0, 2]);
            done();
        });
    });

    it('organisatorCorrectingAnswers should set canChangeChoices to false and execute displayQuestionResults state', () => {
        spyOn(service, 'executeState');

        // @ts-ignore -- Accéder à une méthode privée
        service.organisatorCorrectingAnswers();

        expect(service.canChangeChoices).toBeFalse();
        expect(service.executeState).toHaveBeenCalledWith(GameState.DisplayQuestionResults);
    });

    it('correctAnswers should update correct answers and user score', async () => {
        const correctChoicesIndices = [1];
        const points = 5;
        quizService.correctQuizAnswers.and.returnValue(of({ correctChoicesIndices, points } as QuestionFeedback));

        service.game = { quiz: { _id: 'quizId' }, type: GameType.Test } as unknown as Game;
        service.actualQuestionIndex = 0;
        service.selectedChoices = [1];

        // @ts-ignore -- Accéder à une méthode privée
        await service.correctAnswers();

        expect(service.answers.value).toEqual(correctChoicesIndices);
        expect(service.user.score).toEqual(points * INCREMENTE_SCORE);
    });

    it('displayQuizResults should execute End state', () => {
        spyOn(service, 'executeState');
        // @ts-ignore -- Accéder à une méthode privée
        service.displayQuizResults();
        expect(service.executeState).toHaveBeenCalledWith(GameState.End);
    });

    it('gameEnd should navigate to quiz description for Test game', () => {
        service.game = { type: GameType.Test, quiz: { _id: 'quizId' } } as unknown as Game;
        // @ts-ignore -- Accéder à une méthode privée
        service.gameEnd();
        expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/create/description/quizId');
    });

    it('handleError should navigate to /error-404 for NotFound errors', () => {
        const errorResponse = new HttpErrorResponse({
            status: HttpStatusCode.NotFound,
            error: 'Not found',
        });

        // @ts-ignore -- Accéder à une méthode privée
        service.handleError(errorResponse).subscribe({
            error: (error) => {
                expect(error.message).toEqual('Impossible to find this game');
                expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/error-404', { replaceUrl: true });
            },
        });
    });

    it('handle next question without index', () => {
        const result = service.nextQuestion();
        expect(result).toBeTrue();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(service.actualQuestion.value).toEqual(service.game!.quiz.questions[1]);
    });

    it('should call executeState with PlayersAnswerQuestion if there is no next question', () => {
        spyOn(service, 'executeState');
        spyOn(service, 'nextQuestion').and.returnValue(false);
        // @ts-ignore: Accès à une méthode privée pour le test
        service.goNextQuestion();
        expect(service.executeState).toHaveBeenCalledWith(GameState.DisplayQuizResults);
    });

    it('should call executeState with OrganisatorCorrectingAnswers if there is a next question', () => {
        spyOn(service, 'executeState');
        spyOn(service, 'nextQuestion').and.returnValue(true);
        // @ts-ignore: Accès à une méthode privée pour le test
        service.goNextQuestion();
        expect(service.executeState).toHaveBeenCalledWith(GameState.PlayersAnswerQuestion);
    });

    it('should call executeState with correct function', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'playersAnswerQuestion');
        service.executeState(GameState.PlayersAnswerQuestion);
        // @ts-ignore: Accès à une méthode privée pour le test
        expect(service.playersAnswerQuestion).toHaveBeenCalled();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'organisatorCorrectingAnswers');
        service.executeState(GameState.OrganisatorCorrectingAnswers);
        // @ts-ignore: Accès à une méthode privée pour le test
        expect(service.organisatorCorrectingAnswers).toHaveBeenCalled();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'displayQuestionResults');
        service.executeState(GameState.DisplayQuestionResults);
        // @ts-ignore: Accès à une méthode privée pour le test
        expect(service.displayQuestionResults).toHaveBeenCalled();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'displayQuizResults');
        service.executeState(GameState.DisplayQuizResults);
        // @ts-ignore: Accès à une méthode privée pour le test
        expect(service.displayQuizResults).toHaveBeenCalled();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn<any>(service, 'gameEnd');
        service.executeState(GameState.End);
        // @ts-ignore: Accès à une méthode privée pour le test
        expect(service.gameEnd).toHaveBeenCalled();
    });
});
