import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { PlayerClient } from '@common/game-types';
import { Question, QuestionType } from '@common/types';
import { Subscription } from 'rxjs';

type ChoiceData = { label: string; amount: number; isCorrect: boolean };

@Component({
    selector: 'app-organisator',
    templateUrl: './organisator.component.html',
    styleUrls: ['./organisator.component.scss'],
})
export class OrganisatorComponent implements OnInit, OnDestroy {
    question: Question | null;
    cooldown: number;
    players: PlayerClient[];
    choices: ChoiceData[];
    timerIsRunning;

    private subscriptions: Subscription[];

    constructor(private gameService: GameService) {
        this.question = null;
        this.cooldown = 0;
        this.players = [];
        this.choices = [];
        this.timerIsRunning = true;
        this.subscriptions = [];
    }

    calculatePurcentage(amount: number): number {
        return amount / this.choices.map((data) => data.amount).reduce((a, b) => a + b, 0);
    }

    getAnswerAmount(): number {
        return this.gameService.filterPlayers().filter((player) => player.answers?.hasConfirmed).length;
    }

    calculateChoices(): void {
        if (this.question?.type === QuestionType.QCM) {
            this.choices = this.question.choices.map((choice, index) => {
                const amount = this.gameService.filterPlayers().filter((player) => {
                    if (!player.answers) return false;
                    return (player.answers.answer as number[]).includes(index);
                }).length;
                return { label: choice.label, amount, isCorrect: choice.isCorrect };
            });
        }
    }

    toggleTimer(): void {
        this.gameService.toggleTimer();
        this.timerIsRunning = !this.timerIsRunning;
    }

    speedUpTimer(): void {
        this.gameService.speedUpTimer();
    }

    nextQuestion(): void {
        this.gameService.nextQuestion();
    }

    ngOnInit(): void {
        this.subscriptions.push(
            this.gameService.question.subscribe((question) => {
                this.question = question;
            }),
        );

        this.subscriptions.push(
            this.gameService.cooldown.subscribe((cooldown) => {
                this.cooldown = cooldown;
            }),
        );

        this.subscriptions.push(
            this.gameService.players.subscribe((players) => {
                this.players = players;
                this.calculateChoices();
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}
