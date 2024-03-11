/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameService } from '@app/services/game/game.service';
import { QuestionType } from '@common/types';
import { of } from 'rxjs';
import { ResultsComponent } from './result-statistics.component';

class MockGameService {
    players = of([
        {
            name: 'Player One',
            role: 'participant',
            score: 100,
            isExcluded: false,
            hasGiveUp: false,
            answers: { hasConfirmed: true, answer: [1], hasInterracted: true },
        },
    ]);
    answers = of({
        scores: [{ name: 'Player One', score: 100, bonus: 0 }],
        choices: [[{ label: 'Answer 1', amount: 10, isCorrect: true }], [{ label: 'Answer 2', amount: 5, isCorrect: false }]],
        questions: [
            {
                _id: 'q1',
                label: 'Question 1',
                type: QuestionType.QCM,
                choices: [],
                points: 1,
                createdAt: new Date(),
                lastModification: new Date(),
            },
            {
                _id: 'q2',
                label: 'Question 2',
                type: QuestionType.QCM,
                choices: [],
                points: 1,
                createdAt: new Date(),
                lastModification: new Date(),
            },
        ],
    });

    filterPlayers = jasmine.createSpy().and.returnValue([
        {
            name: 'Player One',
            role: 'participant',
            score: 100,
            isExcluded: false,
            hasGiveUp: false,
            answers: { hasConfirmed: true, answer: [1], hasInterracted: true },
        },
    ]);
}

describe('ResultsComponent', () => {
    let component: ResultsComponent;
    let fixture: ComponentFixture<ResultsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ResultsComponent],
            providers: [{ provide: GameService, useClass: MockGameService }],
        }).compileComponents();

        fixture = TestBed.createComponent(ResultsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should correctly calculate percentage', () => {
        expect(component.calculatePercentage(10)).toEqual(1);
    });

    it('should return correct answer amount', () => {
        expect(component.getAnswerAmount()).toBe(1);
    });

    it('should navigate to the next question correctly', () => {
        component.nextQuestion();
        expect(component.currentQuestion).toBe(1);
    });

    it('should navigate to the previous question correctly', () => {
        component.nextQuestion();
        component.previousQuestion();
        expect(component.currentQuestion).toBe(0);
    });

    it('should get the current question', () => {
        const question = component.getQuestion();
        expect(question).toBeTruthy();

        // eslint-disable-next-line no-underscore-dangle, @typescript-eslint/no-non-null-assertion
        expect(question!._id).toEqual('q1');
    });

    afterEach(() => {
        fixture.destroy();
    });
});
