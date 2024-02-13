import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';

import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '@app/services/quiz/quiz.service';
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
        expect(component.game).toBeTruthy();
        // eslint-disable-next-line no-underscore-dangle
        expect(component.game._id).toEqual('valid-id');
    });

    it('should navigate to /testing on testGame with valid quiz', () => {
        const spy = spyOn(router, 'navigate');
        fixture.detectChanges();
        component.testGame('valid-id');
        expect(spy).toHaveBeenCalledWith(['/testing', 'valid-id']);
    });

    it('should navigate to /create on createGame with valid quiz', () => {
        const spy = spyOn(router, 'navigate');
        fixture.detectChanges();
        component.createGame('valid-id');
        expect(spy).toHaveBeenCalledWith(['/create']);
    });

    it('should handle hidden quiz in checkQuizBeforeNavigation', () => {
        const spySnackBar = spyOn(snackBar, 'open');

        const spyRouter = spyOn(router, 'navigate');
        component.checkQuizBeforeNavigation('hidden-id', '/create', false);
        expect(spySnackBar).toHaveBeenCalledWith('Ce jeu est actuellement invisible.', 'Fermer', { duration: 5000 });
        expect(spyRouter).toHaveBeenCalledWith(['/create']);
    });
    it('should handle other errors in checkQuizBeforeNavigation', fakeAsync(() => {
        const spySnackBarOpen = spyOn(snackBar, 'open');
        const spyRouterNavigate = spyOn(router, 'navigate');
        spyOn(quizService, 'getQuizById').and.returnValue(throwError(() => new Error()));
        component.checkQuizBeforeNavigation('invalid-id', '/create', true);
        tick();
        expect(spySnackBarOpen).toHaveBeenCalledWith('Ce jeu a été supprimé, veuillez sélectionner un autre jeu', 'Fermer', { duration: 5000 });
        expect(spyRouterNavigate).toHaveBeenCalled();
    }));
});
