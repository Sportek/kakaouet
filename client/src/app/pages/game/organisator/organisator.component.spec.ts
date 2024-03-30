/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GlobalLayoutComponent } from '@app/components/global-layout/global-layout.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { GameService } from '@app/services/game/game.service';
import { QuestionType } from '@common/types';
import { of } from 'rxjs';
import { OrganisatorComponent } from './organisator.component';

class MockGameService {
    actualQuestion = of({
        question: {
            _id: 'question1',
            label: 'Sample Question',
            type: QuestionType.QCM,
            choices: [
                { _id: 'choice1', label: 'Option 1', isCorrect: true },
                { _id: 'choice2', label: 'Option 2', isCorrect: false },
            ],
        },
        answer: [],
    });
    cooldown = of(10);
    players = of([{ id: 'player1', name: 'Player One', answers: { hasConfirmed: true, answer: [0] } }]);
    filterPlayers = jasmine
        .createSpy('filterPlayers')
        .and.returnValue([{ id: 'player1', name: 'Player One', answers: { hasConfirmed: true, answer: [0] } }]);
    toggleTimer = jasmine.createSpy('toggleTimer');
    speedUpTimer = jasmine.createSpy('speedUpTimer');
    nextQuestion = jasmine.createSpy('nextQuestion');
    isLastQuestion = jasmine.createSpy('isLastQuestion').and.returnValue(false);
}

describe('OrganisatorComponent', () => {
    let component: OrganisatorComponent;
    let fixture: ComponentFixture<OrganisatorComponent>;
    let gameService: GameService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OrganisatorComponent, ChatComponent, GlobalLayoutComponent, HeaderComponent],
            imports: [HttpClientTestingModule, MatTooltipModule, MatIconModule, MatSnackBarModule, FormsModule],
            providers: [
                {
                    provide: GameService,
                    useClass: MockGameService,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(OrganisatorComponent);
        component = fixture.componentInstance;
        gameService = TestBed.inject(GameService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize with subscriptions to gameService properties', () => {
        expect(component.cooldown).toBe(10);
        expect(component.actualQuestion).toBeTruthy();
        expect(component.players.length).toBeGreaterThan(0);
    });

    it('calculatePercentage should return correct percentage', () => {
        component.choices = [
            { text: 'Option 1', amount: 2, isCorrect: true },
            { text: 'Option 2', amount: 3, isCorrect: false },
        ];
        const percentage = component.calculatePercentage(component.choices[0].amount);
        expect(percentage).toBeCloseTo(0.4, 1);
    });

    it('getAnswerAmount should return correct amount of players who have confirmed', () => {
        expect(component.getAnswerAmount()).toBe(1);
    });

    it('calculateChoices should correctly calculate choices for QCM question', () => {
        component.ngOnInit();
        expect(component.choices.length).toBe(2);
        expect(component.choices[0].amount).toBe(1);
    });

    it('toggleTimer should toggle the timer state and call gameService', () => {
        const initialTimerState = component.timerIsRunning;
        component.toggleTimer();
        expect(component.timerIsRunning).not.toBe(initialTimerState);
        expect(gameService.toggleTimer).toHaveBeenCalled();
    });

    it('speedUpTimer should call gameService.speedUpTimer', () => {
        component.speedUpTimer();
        expect(gameService.speedUpTimer).toHaveBeenCalled();
    });

    it('nextQuestion should call gameService.nextQuestion', () => {
        component.nextQuestion();
        expect(gameService.nextQuestion).toHaveBeenCalled();
    });

    it('isLastQuestion should return correct value', () => {
        expect(component.isLastQuestion()).toBeFalse();
    });
});
