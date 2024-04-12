import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ConfirmationService } from '@app/services/confirmation/confirmation.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Quiz } from '@common/types';
import { of } from 'rxjs';
import { QuizComponent } from './quiz.component';

describe('QuizComponent', () => {
    let component: QuizComponent;
    let fixture: ComponentFixture<QuizComponent>;
    let quizServiceSpy: jasmine.SpyObj<QuizService>;
    let mockQuizzes: Quiz[];
    let mockConfirmationService: ConfirmationService;

    beforeEach(async () => {
        mockQuizzes = [
            {
                _id: '1',
                title: 'Test Quiz 1',
                description: 'A quiz for testing',
                duration: 30,
                visibility: true,
                questions: [],
                createdAt: new Date(),
                lastModification: new Date(),
            },
        ];
        const mockQuiz: Quiz = {
            _id: '1',
            title: 'Test Quiz',
            description: 'Description for test quiz',
            duration: 30,
            visibility: true,
            questions: [],
            createdAt: new Date(),
            lastModification: new Date(),
        };

        mockConfirmationService = {
            confirm: jasmine.createSpy('confirm').and.callFake((message, callback) => callback()),
            dialog: {} as MatDialog, // Add the missing 'dialog' property
        };

        TestBed.configureTestingModule({
            declarations: [QuizComponent],
            imports: [MatIconModule, RouterModule],
            providers: [
                { provide: ActivatedRoute, useValue: {} },
                // Provide the real QuizService and use the SpyObj only for specific methods
                QuizService,
                {
                    provide: QuizService,
                    useValue: jasmine.createSpyObj('QuizService', [
                        'getAllQuizzes',
                        'updateQuizById',
                        'deleteQuizById',
                        'getQuizUpdates',
                        'changeVisibility',
                        'removeQuiz',
                        'generateQuizAsFile',
                    ]),
                },
                { provide: ConfirmationService, useValue: mockConfirmationService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(QuizComponent);
        component = fixture.componentInstance;

        quizServiceSpy = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
        quizServiceSpy.getAllQuizzes.and.returnValue(of(mockQuizzes));
        quizServiceSpy.getQuizUpdates.and.returnValue(of());
        quizServiceSpy.updateQuizById.and.returnValue(of(mockQuiz));
        quizServiceSpy.deleteQuizById.and.returnValue();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load quizzes on init and handle quiz updates', () => {
        expect(quizServiceSpy.getAllQuizzes).toHaveBeenCalled();
        expect(quizServiceSpy.getQuizUpdates).toHaveBeenCalled();
        expect(component.quizList).toEqual(mockQuizzes);
    });

    it('should handle an empty list of quizzes', () => {
        quizServiceSpy.getAllQuizzes.and.returnValue(of([]));

        component.getListQuestions();

        expect(component.quizList).toBeDefined();
        expect(component.quizList.length).toBe(0);
    });

    it('should refresh quizzes when getQuizUpdates emits', () => {
        quizServiceSpy.getQuizUpdates.and.returnValue(of(undefined));

        fixture.detectChanges();

        quizServiceSpy.getQuizUpdates().subscribe(() => {
            component.getListQuestions();
            expect(component.quizList).toEqual(mockQuizzes);
        });
    });

    it('should change visibility of a quiz', () => {
        const quiz = mockQuizzes[0];
        component.changeVisibility(quiz);
        expect(quizServiceSpy.changeVisibility).toHaveBeenCalledWith(quiz);
    });

    it('should remove a quiz', fakeAsync(() => {
        const quiz = mockQuizzes[0];
        const quizList = mockQuizzes;
        const updatedQuizList = mockQuizzes;
        quizServiceSpy.removeQuiz.and.returnValue(of(updatedQuizList));

        component.removeQuiz(quiz);
        tick();
        expect(quizServiceSpy.removeQuiz).toHaveBeenCalledWith(quiz, quizList);

        expect(component.quizList).toEqual(updatedQuizList);
    }));

    it('should generate a quiz as a file', () => {
        const quiz = mockQuizzes[0];
        component.generateQuizAsFile(quiz);
        expect(quizServiceSpy.generateQuizAsFile).toHaveBeenCalledWith(quiz);
    });
});
