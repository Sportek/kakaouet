import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { Answer } from '@common/game-types';
import { Question, QuestionType } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-vue',
    templateUrl: './game-vue.component.html',
    styleUrls: ['./game-vue.component.scss'],
})
export class GameVueComponent implements OnInit, OnDestroy {
    question: Question | null;
    cooldown: number;
    answer: Answer | null;
    isFinalAnswer: boolean;
    score: number;

    private subscriptions: Subscription[];

    constructor(public gameService: GameService) {
        this.question = null;
        this.cooldown = 0;
        this.answer = null;
        this.isFinalAnswer = false;
        this.score = 0;
        this.subscriptions = [];
    }

    @HostListener('document:keydown', ['$event'])
    keyboardChoices(event: KeyboardEvent) {
        const target = event.target as HTMLElement;
        if (target.tagName === 'INPUT' && target.getAttribute('type') === 'text') return;

        if (this.question?.type === QuestionType.QCM) {
            const possibleChoices = this.question.choices.map((choice, index) => (index + 1).toString());
            if (possibleChoices.includes(event.key)) this.selectAnswer(parseInt(event.key, 10) - 1);
        }

        if (event.key === 'Enter' && !this.isFinalAnswer) this.setResponseAsFinal();
    }

    selectAnswer(index: number): void {
        this.gameService.selectAnswer(index);
    }

    temporary() {
        return true;
    }

    ngOnInit(): void {
        this.subscriptions.push(
            this.gameService.question.subscribe((question) => {
                this.question = question;
                this.answer = this.question?.type === QuestionType.QCM ? [] : '';
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
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    isSelected(index: number): boolean {
        return (this.answer as number[]).includes(index);
    }

    setResponseAsFinal(): void {
        this.gameService.setResponseAsFinal();
    }
}
