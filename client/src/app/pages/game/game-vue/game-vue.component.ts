import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { Variables } from '@common/enum-variables';
import { ActualQuestion, Answer } from '@common/game-types';
import { Choice, GameState, QuestionType } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-vue',
    templateUrl: './game-vue.component.html',
    styleUrls: ['./game-vue.component.scss'],
})
export class GameVueComponent implements OnInit, OnDestroy {
    actualQuestion: ActualQuestion | null;
    cooldown: number;
    answer: Answer | null;
    isFinalAnswer: boolean;
    score: number;
    correctAnswers: Choice[];

    private subscriptions: Subscription[];

    constructor(public gameService: GameService) {
        this.actualQuestion = null;
        this.cooldown = 0;
        this.answer = null;
        this.isFinalAnswer = false;
        this.score = 0;
        this.subscriptions = [];
        this.correctAnswers = [];
    }

    @HostListener('document:keydown', ['$event'])
    keyboardChoices(event: KeyboardEvent) {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' && target.getAttribute('type') === 'text') return;

        if (this.actualQuestion?.question?.type === QuestionType.QCM) {
            const possibleChoices = this.actualQuestion?.question.choices.map((choice, index) => (index + 1).toString());
            if (possibleChoices.includes(event.key)) this.selectAnswer(parseInt(event.key, 10) - 1);
        }

        if (event.key === 'Enter') this.setResponseAsFinal();
    }

    selectAnswer(index: number): void {
        this.gameService.selectAnswer(index);
    }

    displayCharactersLeft() {
        return 'Il reste ' + (Variables.MaxCharacters - (this.answer?.length ?? 0)) + ' caractères à la réponse.';
    }

    modifyAnswerQRL(): void {
        this.gameService.modifyAnswerQRL(this.answer as string);
    }

    giveUp() {
        this.gameService.giveUp();
    }

    ngOnInit(): void {
        this.subscriptions.push(
            this.gameService?.actualQuestion.subscribe((actualQuestion) => {
                this.actualQuestion = actualQuestion;
                this.answer = this.actualQuestion?.question?.type === QuestionType.QCM ? [] : '';
            }),
        );

        this.subscriptions.push(
            this.gameService.cooldown.subscribe((cooldown) => {
                this.cooldown = cooldown;
            }),
        );

        this.subscriptions.push(
            this.gameService.isFinalAnswer.subscribe((isFinalAnswer) => {
                this.isFinalAnswer = isFinalAnswer;
            }),
        );

        this.subscriptions.push(
            this.gameService.client.subscribe((client) => {
                this.score = client.score;
            }),
        );

        this.subscriptions.push(
            this.gameService.answer.subscribe((answer) => {
                this.answer = answer;
            }),
        );

        this.subscriptions.push(
            this.gameService.getCorrectAnswers().subscribe((choices) => {
                this.correctAnswers = choices;
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    isSelected(index: number): boolean {
        return (this.answer as number[]).includes(index);
    }

    setResponseAsFinal(): void {
        if (this.actualQuestion?.question.type === QuestionType.QRL && this.answer) this.gameService.enterAnswer(this.answer as string);
        this.gameService.setResponseAsFinal();
    }

    isIncorrectAnswer(choice: Choice): boolean {
        if (this.gameService.gameState.getValue() !== GameState.DisplayQuestionResults) return false;
        let isIncorrect = true;
        this.correctAnswers.forEach((correctChoice) => {
            if (choice.text === correctChoice.text) isIncorrect = false;
        });
        return isIncorrect;
    }

    isDisplayingResults(): boolean {
        return this.gameService.gameState.getValue() === GameState.DisplayQuestionResults;
    }
}
