import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Question, Quiz } from '@common/types';
import { of } from 'rxjs';
import { CreateUpdateQuizComponent } from './create-update-quiz.component';

describe('CreateUpdateQuizComponent', () => {
    let component: CreateUpdateQuizComponent;
    let fixture: ComponentFixture<CreateUpdateQuizComponent>;
    let quizServiceMock: jasmine.SpyObj<QuizService>;
    let mockQuizzes: Quiz;
    let mockQuestions: Question[];

    beforeEach(async () => {
        mockQuizzes = {
            _id: 'fakeID',
            name: 'name',
            description: 'description',
            duration: 10,
            visibility: true,
            // eslint-disable-next-line no-undef
            questions: mockQuestions,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        TestBed.configureTestingModule({
            declarations: [CreateUpdateQuizComponent],
            imports: [HttpClientModule, HttpClientTestingModule, FormsModule],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: new Map().set('gameId', 1) },
                    },
                },
                { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
            ],
        });

        quizServiceMock = jasmine.createSpyObj('QuizService', ['getQuizById']);
        quizServiceMock.getQuizById.and.returnValue(of(mockQuizzes));

        await TestBed.configureTestingModule({
            declarations: [CreateUpdateQuizComponent],
            providers: [{ provide: QuizService, useValue: quizServiceMock }],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateUpdateQuizComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
