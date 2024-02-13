/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '@app/services/game/game.service';
import { GameState } from '@common/types';
import { of } from 'rxjs';
import { GameVueComponent } from './game-vue.component';

class MockGameService {
    actualQuestion = of({
        type: 'QCM',
        label: 'Sample Question',
        points: 1,
        choices: [{ label: 'Choice 1', isCorrect: true }],
    });
    canChangeChoices = true;
    selectedChoices = [];
    gameState = 'SOME_STATE';
    user = { id: '123', name: 'John Doe', score: 0 };

    init = jasmine.createSpy('init').and.returnValue(Promise.resolve());
    selectChoice = jasmine.createSpy('selectChoice');
    getCorrectAnswers = jasmine.createSpy('getCorrectAnswers').and.returnValue(of([0]));

    getQuestionPoints = jasmine.createSpy('getQuestionPoints').and.returnValue(of(5));
    getQuestionLabel = jasmine.createSpy('getQuestionLabel').and.returnValue(of('Quelle est la question ?'));
    isQCMQuestion = jasmine.createSpy('isQCMQuestion').and.returnValue(of(true));
    getQCMChoices = jasmine.createSpy('getQCMChoices').and.returnValue(of([{ label: 'Réponse 1' }, { label: 'Réponse 2' }]));

    timer = { getTimer: jasmine.createSpy('getTimer').and.returnValue(30) };
    isSelected = jasmine.createSpy('isSelected').and.callFake((index) => index === 0);
    giveUp = jasmine.createSpy('giveUp');
}

describe('GameVueComponent', () => {
    let component: GameVueComponent;
    let fixture: ComponentFixture<GameVueComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GameVueComponent],
            imports: [HttpClientTestingModule],
            providers: [
                { provide: GameService, useClass: MockGameService },
                { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map().set('id', 'test') } } },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(GameVueComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize game with given id', async () => {
        const gameService = TestBed.inject(GameService);
        await fixture.whenStable();
        expect(gameService.init).toHaveBeenCalledWith('test');
    });

    it('should not process keyboard events when focused on text input', () => {
        const event = new KeyboardEvent('keydown', { key: 'A' });
        Object.defineProperty(event, 'target', { value: { tagName: 'INPUT', getAttribute: () => 'text' } });
        component.keyboardChoices(event);
        const gameService = TestBed.inject(GameService);
        expect(gameService.selectChoice).not.toHaveBeenCalled();
    });

    it('should show snackbar message if no choice is selected', () => {
        const snackBar = TestBed.inject(MatSnackBar);
        component.setResponseAsFinal();
        expect(snackBar.open).toHaveBeenCalledWith('Veuillez sélectionner au moins une réponse', '❌', { duration: 2000 });
    });

    it('should select a choice when key pressed corresponds to a choice', () => {
        const event = new KeyboardEvent('keydown', { key: '1' });
        Object.defineProperty(event, 'target', { value: { tagName: 'BOB', getAttribute: () => 'text' } });
        component.keyboardChoices(event);
        const gameService = TestBed.inject(GameService);
        expect(gameService.selectChoice).toHaveBeenCalledWith(0);
    });

    it('should set canChangeChoices to false after setResponseAsFinal is called', () => {
        component.gameService.canChangeChoices = true;
        component.gameService.selectedChoices.push(1);
        component.setResponseAsFinal();
        expect(component.gameService.canChangeChoices).toBeFalse();
    });

    it('should call setResponseAsFinal when Enter is pressed and canChangeChoices is true', () => {
        component.gameService.canChangeChoices = true;
        spyOn(component, 'setResponseAsFinal');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        Object.defineProperty(event, 'target', { value: { tagName: 'BOB', getAttribute: () => 'text' } });
        component.keyboardChoices(event);
        expect(component.setResponseAsFinal).toHaveBeenCalled();
    });

    it('should correctly identify if an answer is not included in the correct answers when gameState is DisplayQuestionResults', () => {
        component.gameService.getCorrectAnswers = jasmine.createSpy().and.returnValue(of([1, 2]));
        component.gameService.gameState = GameState.DisplayQuestionResults;
        component.isIncorrectAnswer(0).subscribe((isIncorrect) => {
            expect(isIncorrect).toBeTrue();
        });
        component.isIncorrectAnswer(1).subscribe((isIncorrect) => {
            expect(isIncorrect).toBeFalse();
        });
    });
});
