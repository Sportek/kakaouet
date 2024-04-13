import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuizService } from '@app/services/quiz/quiz.service';
import { of, throwError } from 'rxjs';
import { CreatePageComponent } from './create-page.component';

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    let quizServiceMock: any;
    let matSnackBarMock: any;

    beforeEach(async () => {
        quizServiceMock = {
            getAllQuizzes: jasmine.createSpy('getAllQuizzes').and.returnValue(of([{ id: '1', name: 'Quiz 1' }])),
            getRandomQuiz: jasmine.createSpy('getRandomQuiz').and.returnValue(of({ id: 'random', name: 'Random Quiz' }))
        };
        matSnackBarMock = {
            open: jasmine.createSpy('open')
        };

        await TestBed.configureTestingModule({
            declarations: [CreatePageComponent],
            providers: [
                { provide: QuizService, useValue: quizServiceMock },
                { provide: MatSnackBar, useValue: matSnackBarMock }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch quizzes and a random quiz on init', () => {
        expect(quizServiceMock.getAllQuizzes).toHaveBeenCalled();
        expect(quizServiceMock.getRandomQuiz).toHaveBeenCalled();
        expect(component.games.length).toBe(2);
    });

    it('should handle errors when fetching a random quiz', () => {
        quizServiceMock.getRandomQuiz.and.returnValue(throwError(() => new Error('Error')));
        component.getQuizzes();
        expect(matSnackBarMock.open).toHaveBeenCalledWith('Pas assez de question pour générer un random quiz', 'Fermer', {
            duration: 3000
        });
    });
});
