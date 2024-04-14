import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuizService } from '@app/services/quiz/quiz.service';
import { of, throwError } from 'rxjs';
import { CreatePageComponent } from './create-page.component';

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let quizServiceMock: Partial<QuizService>;
    let matSnackBarMock: Partial<MatSnackBar>;

    beforeEach(async () => {
        quizServiceMock = {
            getAllQuizzes: jasmine.createSpy().and.returnValue(of([{ id: '1', name: 'Quiz 1' }])),
            getRandomQuiz: jasmine.createSpy().and.returnValue(of({ id: 'random', name: 'Random Quiz' })),
        };
        matSnackBarMock = {
            open: jasmine.createSpy(),
        };

        await TestBed.configureTestingModule({
            declarations: [CreatePageComponent],
            providers: [
                { provide: QuizService, useValue: quizServiceMock },
                { provide: MatSnackBar, useValue: matSnackBarMock },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should handle errors when fetching a random quiz', () => {
        (quizServiceMock.getRandomQuiz as jasmine.Spy).and.returnValue(throwError(() => new Error('Error')));
        component.getQuizzes();
        fixture.detectChanges();

        expect(matSnackBarMock.open).toHaveBeenCalledWith('Pas assez de question pour générer un random quiz', 'Fermer', {
            duration: 3000,
        });
    });
    it('should combine random quiz with other quizzes correctly', () => {
        component.getQuizzes();
        fixture.detectChanges();

        expect(component.games.length).toBe(2);
        expect(quizServiceMock.getAllQuizzes).toHaveBeenCalled();
        expect(quizServiceMock.getRandomQuiz).toHaveBeenCalled();
    });
});
