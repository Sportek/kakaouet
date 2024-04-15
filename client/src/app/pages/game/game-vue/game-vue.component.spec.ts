import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GlobalLayoutComponent } from '@app/components/global-layout/global-layout.component';
import { HeaderComponent } from '@app/components/header/header.component';
import { WORKING_QUIZ } from '@app/fake-quizzes';
import { GameService } from '@app/services/game/game.service';
import { Variables } from '@common/enum-variables';
import { GameState, Question } from '@common/types';
import { cloneDeep } from 'lodash';
import { GameVueComponent } from './game-vue.component';

describe('GameVueComponent', () => {
    let component: GameVueComponent;
    let fixture: ComponentFixture<GameVueComponent>;
    let gameService: GameService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [GameVueComponent, ChatComponent, GlobalLayoutComponent, HeaderComponent],
            imports: [HttpClientTestingModule, MatIconModule, FormsModule],
            providers: [
                { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map().set('id', 'test') } } },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(GameVueComponent);
        component = fixture.componentInstance;
        gameService = TestBed.inject(GameService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('keyboardChoices()', () => {
        it('should return immediately upon input event', () => {
            const inputElement = document.createElement('INPUT');
            inputElement.setAttribute('type', 'text');
            document.body.appendChild(inputElement);
            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            inputElement.dispatchEvent(event);

            const selectAnswerComponent = spyOn(component, 'selectAnswer');

            component.keyboardChoices(event);

            expect(selectAnswerComponent).not.toHaveBeenCalled();
        });

        it('should select answer if correct KeyboardEvent submitted', () => {
            const inputElement = document.createElement('div');
            document.body.appendChild(inputElement);
            const event = new KeyboardEvent('keydown', { key: '1' });
            inputElement.dispatchEvent(event);

            const selectAnswerSpy = spyOn(component, 'selectAnswer');

            component.actualQuestion = {
                question: cloneDeep(WORKING_QUIZ.questions[0] as Question),
                totalQuestion: 1,
                actualIndex: 1,
            };

            component.keyboardChoices(event);

            expect(selectAnswerSpy).toHaveBeenCalledWith(0);
        });

        it('should set current answer as final', () => {
            const inputElement = document.createElement('div');
            document.body.appendChild(inputElement);
            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            inputElement.dispatchEvent(event);

            const setResponseAsFinalSpy = spyOn(component, 'setResponseAsFinal');

            component.actualQuestion = {
                question: cloneDeep(WORKING_QUIZ.questions[0] as Question),
                totalQuestion: 1,
                actualIndex: 1,
            };

            component.keyboardChoices(event);

            expect(setResponseAsFinalSpy).toHaveBeenCalled();
        });
    });

    it('should select answer', () => {
        const gameServiceSpy = spyOn(gameService, 'selectAnswer');
        component.selectAnswer(0);
        expect(gameServiceSpy).toHaveBeenCalledWith(0);
    });

    it('should give up', () => {
        const gameServiceSpy = spyOn(gameService, 'giveUp');
        component.giveUp();
        expect(gameServiceSpy).toHaveBeenCalled();
    });

    it('should return the answer', () => {
        component.answer = '1';
        const result = component.isSelected(1);
        expect(result).toBeTrue();
    });

    it('should set response as final', () => {
        const gameServiceSpy = spyOn(gameService, 'setResponseAsFinal');
        component.setResponseAsFinal();
        expect(gameServiceSpy).toHaveBeenCalled();
    });

    describe('isIncorrectAnswer', () => {
        it('should return false if not displaying results', () => {
            gameService.gameState.next(GameState.WaitingPlayers);
            const result = component.isIncorrectAnswer({ _id: 1, text: 'Choix 1', isCorrect: true });
            expect(result).toBeFalse();
        });

        it('should return true if choice is incorrect', () => {
            gameService.gameState.next(GameState.DisplayQuestionResults);
            gameService.correctAnswers.next([{ _id: 2, text: 'Choix 2', isCorrect: true }]);
            const result = component.isIncorrectAnswer({ _id: 1, text: 'Choix 1', isCorrect: true });
            expect(result).toBeTrue();
        });

        it('should return false if choice is correct', () => {
            gameService.gameState.next(GameState.DisplayQuestionResults);
            gameService.correctAnswers.next([{ _id: 1, text: 'Choix 1', isCorrect: true }]);
            const result = component.isIncorrectAnswer({ _id: 1, text: 'Choix 1', isCorrect: true });
            expect(result).toBeFalse();
        });
    });

    it('should display the correct number of characters left', () => {
        component.answer = 'test';
        const remaining = Variables.MaxCharacters - component.answer.length;
        expect(component.displayCharactersLeft()).toEqual(`Il reste ${remaining} caractères à la réponse.`);

        component.answer = '';
        expect(component.displayCharactersLeft()).toEqual(`Il reste ${Variables.MaxCharacters} caractères à la réponse.`);

        component.answer = null;
        expect(component.displayCharactersLeft()).toEqual(`Il reste ${Variables.MaxCharacters} caractères à la réponse.`);
    });

    it('should call modifyAnswerQRL on gameService with the current answer', () => {
        const modifyAnswerSpy = spyOn(gameService, 'modifyAnswerQRL');
        component.answer = 'new answer';
        component.modifyAnswerQRL();
        expect(modifyAnswerSpy).toHaveBeenCalledWith('new answer');
    });
});
