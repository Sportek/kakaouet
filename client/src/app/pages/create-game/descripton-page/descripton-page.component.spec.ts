import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { QuizService } from '@app/services/quiz/quiz.service';
import { of } from 'rxjs';
import { Quiz } from './../../../../../../common/types';
import { DescriptonPageComponent } from './descripton-page.component';

describe('DescriptonPageComponent', () => {
    let component: DescriptonPageComponent;
    let fixture: ComponentFixture<DescriptonPageComponent>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let quizServiceMock: any;
    let mockQuizzes: Quiz[];

    beforeEach(async () => {
        mockQuizzes = [
            {
                _id: '007',
                name: 'Quiz 1',
                duration: 60,
                description: 'This is the description of question 1',
                visibility: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                questions: [
                    /* {
                        type: QuestionType.QCM,
                        choices: [
                            {
                            id: number,
                            label: string;
                            isCorrect: boolean,
                            }
                        ],
                    },*/
                ],
            },
        ];

        TestBed.configureTestingModule({
            declarations: [DescriptonPageComponent],
            imports: [HttpClientModule, HttpClientTestingModule],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: new Map().set('gameId', 1) },
                    },
                },
            ],
        });

        // Properly type the mock using jasmine.SpyObj
        quizServiceMock = jasmine.createSpyObj('QuizService', ['getQuizById']);
        quizServiceMock.getQuizById.and.returnValue(of(mockQuizzes));

        await TestBed.configureTestingModule({
            declarations: [DescriptonPageComponent],
            providers: [{ provide: QuizService, useValue: quizServiceMock }],
        }).compileComponents();

        fixture = TestBed.createComponent(DescriptonPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getQuiz on init', () => {
        expect(quizServiceMock.getQuizById).toHaveBeenCalled();
    });
});
