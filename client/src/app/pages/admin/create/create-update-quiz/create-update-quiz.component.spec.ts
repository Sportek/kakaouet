import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Quiz } from '@common/types';
import { of } from 'rxjs';
import { CreateUpdateQuizComponent } from './create-update-quiz.component';

describe('CreateUpdateQuizComponent', () => {
    let component: CreateUpdateQuizComponent;
    let fixture: ComponentFixture<CreateUpdateQuizComponent>;
    // let mockActivatedRoute;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let quizServiceMock: any;
    let mockQuizzes: Quiz[];

    beforeEach(async () => {
        /* mockActivatedRoute = {
            paramMap: of(paramMap),
        };*/

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
