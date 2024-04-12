/* import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';

import { HttpErrorResponse } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WORKING_QUIZ } from '@app/fake-quizzes';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { GameType, Quiz } from '@common/types';
import { cloneDeep } from 'lodash';
import { DescriptonPageComponent } from './descripton-page.component';

class MockQuizService {
    getQuizById(id: string): Observable<unknown> {
        if (id === 'valid-id') {
            return of({ _id: 'valid-id', name: 'Valid Quiz', visibility: true, questions: [] });
        } else if (id === 'hidden-id') {
            return of({ _id: 'hidden-id', name: 'Hidden Quiz', visibility: false, questions: [] });
        } else {
            return throwError(() => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }));
        }
    }
}

describe('DescriptonPageComponent', () => {
    let component: DescriptonPageComponent;
    let fixture: ComponentFixture<DescriptonPageComponent>;
    let notificationService: jasmine.SpyObj<NotificationService>;
    let router: Router;
    let quizService: QuizService;

    beforeEach(async () => {
        notificationService = jasmine.createSpyObj('NotificationService', ['error']);
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            declarations: [DescriptonPageComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: QuizService, useClass: MockQuizService },
                { provide: NotificationService, useValue: notificationService },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: {
                            paramMap: {
                                get: () => 'valid-id',
                            },
                        },
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DescriptonPageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        quizService = TestBed.inject(QuizService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getQuiz on init with valid id', () => {
        const spyGetQuiz = spyOn(component, 'getQuizDetails').and.callThrough();
        fixture.detectChanges();
        expect(spyGetQuiz).toHaveBeenCalledWith('valid-id');
    });

    it('should redirect if quiz not found', () => {
        const routerNavigationSpy = spyOn(router, 'navigateByUrl');
        spyOn(quizService, 'getQuizById').and.returnValue(
            throwError(() => {
                return { status: 404 };
            }),
        );

        component.getQuizDetails('fakeId');

        expect(routerNavigationSpy).toHaveBeenCalledWith('/error-404', { replaceUrl: true });
    });

    it('should set game data on valid quiz fetch', () => {
        fixture.detectChanges();
        expect(component.quiz).toBeTruthy();
        // eslint-disable-next-line no-underscore-dangle
        expect(component.quiz._id).toEqual('valid-id');
    });

    it('should call createNewGame on createGame', () => {
        // @ts-ignore -- Obligé de mocker la méthode car elle est privée
        const spy = spyOn(component.gameService, 'createNewGame');
        fixture.detectChanges();
        component.createGame('valid-id');
        expect(spy).toHaveBeenCalledWith('valid-id', GameType.Default);
    });

    it('should handle hidden quiz in checkQuizBeforeNavigation', () => {
        const spyRouter = spyOn(router, 'navigate');
        component.checkQuizBeforeNavigation('hidden-id', '/create', false);
        expect(notificationService.error).toHaveBeenCalledWith('Ce jeu est actuellement invisible.');
        expect(spyRouter).toHaveBeenCalledWith(['/create']);
    });

    it('should handle notFound errors in checkQuizBeforeNavigation', fakeAsync(() => {
        const spyRouterNavigate = spyOn(router, 'navigate');
        spyOn(quizService, 'getQuizById').and.returnValue(throwError(() => new Error()));
        component.checkQuizBeforeNavigation('invalid-id', '/create', true);
        tick();
        expect(notificationService.error).toHaveBeenCalledWith('Ce jeu a été supprimé, veuillez sélectionner un autre jeu');
        expect(spyRouterNavigate).toHaveBeenCalled();
    }));

    it('should handle other errors in checkQuizBeforeNavigation', fakeAsync(() => {
        spyOn(quizService, 'getQuizById').and.returnValue(
            throwError(() => {
                return { status: 500 };
            }),
        );
        component.checkQuizBeforeNavigation('invalid-id', '/create', true);
        tick();
        expect(notificationService.error).toHaveBeenCalledWith('Une erreur est survenue. Veuillez réessayer.');
    }));

    it('should navigate to specified path', fakeAsync(() => {
        const spyRouterNavigate = spyOn(router, 'navigate');
        const visibilityOnQuiz = cloneDeep(WORKING_QUIZ as Quiz);
        visibilityOnQuiz.visibility = true;
        spyOn(quizService, 'getQuizById').and.returnValue(of(visibilityOnQuiz));
        component.checkQuizBeforeNavigation('fakeId', '/fakePath', false);
        tick();
        expect(spyRouterNavigate).toHaveBeenCalledWith(['/fakePath']);
    }));

    it('should navigate to specified path with gameId', fakeAsync(() => {
        const spyRouterNavigate = spyOn(router, 'navigate');
        const visibilityOnQuiz = cloneDeep(WORKING_QUIZ as Quiz);
        visibilityOnQuiz.visibility = true;
        spyOn(quizService, 'getQuizById').and.returnValue(of(visibilityOnQuiz));
        component.checkQuizBeforeNavigation('fakeId', '/fakePath', true);
        tick();
        expect(spyRouterNavigate).toHaveBeenCalledWith(['/fakePath', 'fakeId']);
    }));

    it('should create a new game', () => {
        // @ts-ignore
        const gameServiceSpy = spyOn(component.gameService, 'createNewGame');
        component.testGame('fakeId');

        expect(gameServiceSpy).toHaveBeenCalledWith('fakeId', GameType.Test);
    });
});
 */
