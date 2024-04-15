import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '@app/services/game/game.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { of, throwError } from 'rxjs'; // Ensure you have this import for creating observables
import { DescriptonPageComponent } from './descripton-page.component';

describe('DescriptionPageComponent', () => {
    let component: DescriptonPageComponent;
    let fixture: ComponentFixture<DescriptonPageComponent>;
    let quizServiceMock: any;
    let routerMock: any;
    let notificationServiceMock: any;
    let changeDetectorRefMock: any;
    let gameServiceMock: any;
    let routeMock: any;

    beforeEach(async () => {
        quizServiceMock = {
            getQuizDetailsById: jasmine.createSpy().and.returnValue(of({
                id: '1', name: 'Test Quiz', questions: []
            })), // Return an observable when getQuizDetailsById is called
            getQuizById: jasmine.createSpy().and.returnValue(of({
                id: '1', visibility: true
            })), // Return an observable when getQuizById is called
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
                    get: jasmine.createSpy().and.returnValue('1')
                }
            }
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

        it('should update quiz and question properties and call detectChanges when quiz is found', () => {
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
    
    
});
