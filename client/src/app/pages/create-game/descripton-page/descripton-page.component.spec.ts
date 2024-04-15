import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '@app/services/game/game.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { GameType } from '@common/types';
import { of, throwError } from 'rxjs';
import { DescriptonPageComponent } from './descripton-page.component';

describe('DescriptionPageComponent', () => {
    let component: DescriptonPageComponent;
    let fixture: ComponentFixture<DescriptonPageComponent>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let quizServiceMock: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let routerMock: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let notificationServiceMock: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let changeDetectorRefMock: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let gameServiceMock: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let routeMock: any;

    beforeEach(async () => {
        quizServiceMock = {
            getQuizDetailsById: jasmine.createSpy().and.returnValue(
                of({
                    id: '1',
                    name: 'Test Quiz',
                    questions: [],
                }),
            ), 
            getQuizById: jasmine.createSpy().and.returnValue(
                of({
                    id: '1',
                    visibility: true,
                }),
            ), 
        };
        routerMock = {
            navigate: jasmine.createSpy(),
            navigateByUrl: jasmine.createSpy(),
        };
        notificationServiceMock = {
            error: jasmine.createSpy(),
        };
        changeDetectorRefMock = {
            detectChanges: jasmine.createSpy(),
        };
        gameServiceMock = {
            createNewGame: jasmine.createSpy(),
        };
        routeMock = {
            snapshot: {
                paramMap: {
                    get: jasmine.createSpy().and.returnValue('1'),
                },
            },
        };

        await TestBed.configureTestingModule({
            declarations: [DescriptonPageComponent],
            providers: [
                { provide: QuizService, useValue: quizServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: NotificationService, useValue: notificationServiceMock },
                { provide: ChangeDetectorRef, useValue: changeDetectorRefMock },
                { provide: GameService, useValue: gameServiceMock },
                { provide: ActivatedRoute, useValue: routeMock },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(DescriptonPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('loadQuizDetails', () => {
        it('should navigate to error-404 if no gameId is found in the route parameters', () => {
            routeMock.snapshot.paramMap.get.and.returnValue(null);
            component.loadQuizDetails();
            expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/error-404');
        });

        it('should call getQuizDetails with quizId if gameId is present', () => {
            const expectedQuizId = '123';
            routeMock.snapshot.paramMap.get.and.returnValue(expectedQuizId);
            component.loadQuizDetails();
            expect(quizServiceMock.getQuizDetailsById).toHaveBeenCalledWith(expectedQuizId);
        });
    });

    describe('getQuizDetails', () => {
        it('should handle not found quiz by navigating to error-404', () => {
            const quizId = 'invalidQuizId';
            quizServiceMock.getQuizDetailsById.and.returnValue(of(null));
            component.getQuizDetails(quizId);
            expect(notificationServiceMock.error).toHaveBeenCalledWith('Quiz introuvable.');
            expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/error-404');
        });

        it('should update quiz and question properties and call detectChanges when quiz is found', () => {
            const quizId = 'validQuizId';
            const quiz = { id: '1', name: 'Test Quiz', questions: [{ id: 'q1', text: 'Question?' }] };
            quizServiceMock.getQuizDetailsById.and.returnValue(of(quiz));
            component.getQuizDetails(quizId);
            expect(changeDetectorRefMock.detectChanges).not.toHaveBeenCalled();
        });

        it('should not update quiz and question properties and call detectChanges when quiz is not found', () => {
            const quizId = 'validQuizId';
            quizServiceMock.getQuizDetailsById.and.returnValue(of(null));
            component.getQuizDetails(quizId);
            expect(changeDetectorRefMock.detectChanges).not.toHaveBeenCalled();
        });

        it('should navigate to error-404 with replaceUrl when there is an API error', () => {
            const quizId = 'quizId';
            quizServiceMock.getQuizDetailsById.and.returnValue(throwError(() => new Error('API Error')));
            component.getQuizDetails(quizId);
            expect(notificationServiceMock.error).toHaveBeenCalledWith('Une erreur est survenue lors de la récupération du quiz.');
            expect(routerMock.navigateByUrl).toHaveBeenCalledWith('/error-404', { replaceUrl: true });
        });
    });

    describe('testGame', () => {
        it('should call createNewGame on GameService with the correct parameters', () => {
            const quizId = 'testQuizId';
            component.testGame(quizId);
            expect(gameServiceMock.createNewGame).toHaveBeenCalledWith(quizId, GameType.Test);
        });
    });

    describe('createGame', () => {
        it('should call createNewGame with GameType.Random when quizId matches ramdomId', () => {
            const quizId = 'randomId';
            component.ramdomId = quizId;
            component.createGame(quizId);
            expect(gameServiceMock.createNewGame).toHaveBeenCalledWith(quizId, GameType.Random);
        });

        it('should call createNewGame with GameType.Default when quizId does not match ramdomId', () => {
            const quizId = 'someOtherId';
            component.ramdomId = 'randomId';
            component.createGame(quizId);
            expect(gameServiceMock.createNewGame).toHaveBeenCalledWith(quizId, GameType.Default);
        });
    });

    describe('checkQuizBeforeNavigation', () => {
        it('should navigate to creation page if the quiz is not visible', () => {
            const gameId = 'invisibleQuizId';
            quizServiceMock.getQuizById.and.returnValue(of({ visibility: false }));
            component.checkQuizBeforeNavigation(gameId, '/somepath');
            expect(notificationServiceMock.error).toHaveBeenCalledWith('Ce jeu est actuellement invisible.');
            expect(routerMock.navigate).toHaveBeenCalledWith(['/create']);
        });

        it('should navigate to the specified path with gameId if quiz is visible and includeId is true', () => {
            const gameId = 'visibleQuizId';
            const path = '/game';
            quizServiceMock.getQuizById.and.returnValue(of({ visibility: true }));
            component.checkQuizBeforeNavigation(gameId, path, true);
            expect(routerMock.navigate).toHaveBeenCalledWith([path, gameId]);
        });

        it('should navigate to the specified path without gameId if quiz is visible and includeId is false', () => {
            const gameId = 'visibleQuizId';
            const path = '/game';
            quizServiceMock.getQuizById.and.returnValue(of({ visibility: true }));
            component.checkQuizBeforeNavigation(gameId, path, false);
            expect(routerMock.navigate).toHaveBeenCalledWith([path]);
        });

        it('should navigate to creation page with error notification if the quiz has been deleted', () => {
            const gameId = 'deletedQuizId';
            const errorResponse = { status: component.notFound };
            quizServiceMock.getQuizById.and.returnValue(throwError(() => errorResponse));
            component.checkQuizBeforeNavigation(gameId, '/game');
            expect(notificationServiceMock.error).toHaveBeenCalledWith('Ce jeu a été supprimé, veuillez sélectionner un autre jeu');
            expect(routerMock.navigate).toHaveBeenCalledWith(['/create']);
        });

        it('should navigate to creation page with a generic error notification if there is an API error', () => {
            const gameId = 'quizWithApiError';
            const errorResponse = { status: 500 };
            quizServiceMock.getQuizById.and.returnValue(throwError(() => errorResponse));
            component.checkQuizBeforeNavigation(gameId, '/game');
            expect(notificationServiceMock.error).toHaveBeenCalledWith('Une erreur est survenue. Veuillez réessayer.');
            expect(routerMock.navigate).not.toHaveBeenCalledWith(['/create']);
        });
    });
});
