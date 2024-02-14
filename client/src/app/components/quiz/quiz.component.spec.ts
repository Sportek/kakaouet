import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Quiz } from '@common/types';
import { of } from 'rxjs';
import { QuizComponent } from './quiz.component';

describe('QuizComponent', () => {
    let component: QuizComponent;
    let fixture: ComponentFixture<QuizComponent>;
    let quizServiceSpy: jasmine.SpyObj<QuizService>;
    let mockQuizzes: Quiz[];

    beforeEach(async () => {
        mockQuizzes = [
            {
                _id: '1',
                name: 'Test Quiz 1',
                description: 'A quiz for testing',
                duration: 30,
                visibility: true,
                questions: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];
        const mockQuiz: Quiz = {
            _id: '1',
            name: 'Test Quiz',
            description: 'Description for test quiz',
            duration: 30,
            visibility: true,
            questions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        quizServiceSpy = jasmine.createSpyObj('QuizService', ['getAllQuizzes', 'updateQuizById', 'deleteQuizById', 'getQuizUpdates']);

        quizServiceSpy.getAllQuizzes.and.returnValue(of(mockQuizzes));
        quizServiceSpy.getQuizUpdates.and.returnValue(of());
        quizServiceSpy.updateQuizById.and.returnValue(of(mockQuiz));
        quizServiceSpy.deleteQuizById.and.returnValue(of(undefined));

        await TestBed.configureTestingModule({
            declarations: [QuizComponent],
            imports: [MatIconModule, RouterModule],
            providers: [
                { provide: QuizService, useValue: quizServiceSpy },
                { provide: ActivatedRoute, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuizComponent);
        component = fixture.componentInstance;
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

    it('should change visibility of a quiz', () => {
        const quiz = mockQuizzes[0];
        const originalVisibility = quiz.visibility;

        component.changeVisibility(quiz);

        // eslint-disable-next-line no-underscore-dangle
        expect(quizServiceSpy.updateQuizById).toHaveBeenCalledWith(quiz._id, quiz);
        expect(quiz.visibility).not.toBe(originalVisibility);
    });

    it('should remove a quiz', () => {
        const quiz = mockQuizzes[0];

        component.removeQuiz(quiz);

        // eslint-disable-next-line no-underscore-dangle
        expect(quizServiceSpy.deleteQuizById).toHaveBeenCalledWith(quiz._id);
        expect(component.quizList.includes(quiz)).toBeFalse();
    });

    it('should generate a quiz as a file', () => {
        const dataSpy = spyOn(window.URL, 'createObjectURL');
        const quiz = mockQuizzes[0];

        component.generateQuizAsFile(quiz);

        expect(dataSpy).toHaveBeenCalled();
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
    it('should create and trigger a click on the anchor element for download', () => {
        const quiz = mockQuizzes[0];
        const createElementSpy = spyOn(document, 'createElement').and.callThrough();
        const appendChildSpy = spyOn(document.body, 'appendChild').and.callThrough();
        const clickSpy = spyOn(HTMLElement.prototype, 'click').and.callThrough();
        const revokeObjectURLSpy = spyOn(window.URL, 'revokeObjectURL').and.callThrough();

        component.generateQuizAsFile(quiz);

        const anchorElement = createElementSpy.calls.first().returnValue;

        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(appendChildSpy).toHaveBeenCalledWith(anchorElement);
        expect(clickSpy).toHaveBeenCalled();
        expect(revokeObjectURLSpy).toHaveBeenCalled();
    });
});
