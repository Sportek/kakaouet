import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuizService } from '@app/services/quiz/quiz.service';
import { of } from 'rxjs';
import { Quiz } from './../../../../../../common/types';
// import { Question } from './../../../../../../common/types';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CreatePageComponent } from './create-page.component';

describe('CreatePageComponent', () => {
    let component: CreatePageComponent;
    let fixture: ComponentFixture<CreatePageComponent>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let quizServiceMock: any;
    let mockQuizzes: Quiz[];
    // let mockQuestions: Question[];

    beforeEach(async () => {
        mockQuizzes = [
            {
                _id: '123',
                name: 'Quiz 1',
                duration: 60,
                description: 'This is the description of question 1',
                visibility: true,
                questions: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                _id: '456',
                name: 'Quiz 2',
                duration: 60,
                description: 'This is the description of question 2',
                visibility: true,
                questions: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        // Properly type the mock using jasmine.SpyObj
        quizServiceMock = jasmine.createSpyObj('QuizService', ['getAllQuizzes']);
        quizServiceMock.getAllQuizzes.and.returnValue(of(mockQuizzes));

        await TestBed.configureTestingModule({
            declarations: [CreatePageComponent],
            providers: [
                { provide: QuizService, useValue: quizServiceMock },
                { provide: ActivatedRoute, useValue: {} },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            imports: [RouterModule],
        }).compileComponents();

        fixture = TestBed.createComponent(CreatePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getQuizzes on init', () => {
        expect(quizServiceMock.getAllQuizzes).toHaveBeenCalled();
    });

    // eslint-disable-next-line no-undef
    it('should set games to quizzes returned by the service', (done: DoneFn) => {
        component.getQuizzes();
        fixture.whenStable().then(() => {
            expect(component.games).toEqual(mockQuizzes);
            done();
        });
    });
});
