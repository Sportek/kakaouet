import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';

import { HttpErrorResponse } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WORKING_QUIZ } from '@app/fake-quizzes';
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
    let snackBar: MatSnackBar;
    let router: Router;
    let quizService: QuizService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            declarations: [DescriptonPageComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: QuizService, useClass: MockQuizService },
                MatSnackBar,
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
        snackBar = TestBed.inject(MatSnackBar);
        router = TestBed.inject(Router);
        quizService = TestBed.inject(QuizService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getQuiz on init with valid id', () => {
        const spyGetQuiz = spyOn(component, 'getQuiz').and.callThrough();
        fixture.detectChanges();
        expect(spyGetQuiz).toHaveBeenCalledWith('valid-id');
    });

    it('should set game data on valid quiz fetch', () => {
        fixture.detectChanges();
        expect(component.quiz).toBeTruthy();
        // eslint-disable-next-line no-underscore-dangle
        expect(component.quiz._id).toEqual('valid-id');
    });

    it('should navigate to /testing on testGame with valid quiz', () => {
        const spy = spyOn(router, 'navigate');
        fixture.detectChanges();
        component.testGame('valid-id');
        expect(spy).toHaveBeenCalledWith(['/testing', 'valid-id']);
    });

    it('should call createNewGame on createGame', () => {
        // @ts-ignore -- Obligé de mocker la méthode car elle est privée
        const spy = spyOn(component.gameService, 'createNewGame');
        fixture.detectChanges();
        component.createGame('valid-id');
        expect(spy).toHaveBeenCalledWith('valid-id', GameType.Default);
    });

    it('should handle hidden quiz in checkQuizBeforeNavigation', () => {
        const spySnackBar = spyOn(snackBar, 'open');

        const spyRouter = spyOn(router, 'navigate');
        component.checkQuizBeforeNavigation('hidden-id', '/create', false);
        expect(spySnackBar).toHaveBeenCalledWith('Ce jeu est actuellement invisible.', 'Fermer', { duration: 5000 });
        expect(spyRouter).toHaveBeenCalledWith(['/create']);
    });

    it('should handle notFound errors in checkQuizBeforeNavigation', fakeAsync(() => {
        const spySnackBarOpen = spyOn(snackBar, 'open');
        const spyRouterNavigate = spyOn(router, 'navigate');
        spyOn(quizService, 'getQuizById').and.returnValue(throwError(() => new Error()));
        component.checkQuizBeforeNavigation('invalid-id', '/create', true);
        tick();
        expect(spySnackBarOpen).toHaveBeenCalledWith('Ce jeu a été supprimé, veuillez sélectionner un autre jeu', 'Fermer', { duration: 5000 });
        expect(spyRouterNavigate).toHaveBeenCalled();
    }));

    it('should handle other errors in checkQuizBeforeNavigation', fakeAsync(() => {
        const spySnackBarOpen = spyOn(snackBar, 'open');
        spyOn(quizService, 'getQuizById').and.returnValue(
            throwError(() => {
                return { status: 500 };
            }),
        );
        component.checkQuizBeforeNavigation('invalid-id', '/create', true);
        tick();
        expect(spySnackBarOpen).toHaveBeenCalledWith('Une erreur est survenue. Veuillez réessayer.', 'Fermer', { duration: 5000 });
    }));

    it('should navigate to specified path', fakeAsync(() => {
        const spyRouterNavigate = spyOn(router, 'navigate');
        const visibilityOffQuiz = cloneDeep(WORKING_QUIZ as Quiz);
        visibilityOffQuiz.visibility = true;
        spyOn(quizService, 'getQuizById').and.returnValue(of(visibilityOffQuiz));
        component.checkQuizBeforeNavigation('invalid-id', '/fakePath', false);
        tick();
        expect(spyRouterNavigate).toHaveBeenCalledWith(['/fakePath']);
    }));
});
