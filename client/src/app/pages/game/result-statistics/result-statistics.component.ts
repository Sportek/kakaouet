import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { GameEventsData, PlayerClient } from '@common/game-types';
import { Question } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-results',
    templateUrl: './result-statistics.component.html',
    styleUrls: ['./result-statistics.component.scss'],
})
export class ResultsComponent implements OnInit, OnDestroy {
    players: PlayerClient[];
    answers: GameEventsData.PlayerSendResults;
    currentQuestion: number;

    private subscriptions: Subscription[];

    constructor(private gameService: GameService) {
        this.players = [];
        this.subscriptions = [];
        this.answers = { scores: [], choices: [], questions: [] };
        this.currentQuestion = 0;
    }

    calculatePercentage(amount: number): number {
        return amount / this.answers.choices[this.currentQuestion].map((data) => data.amount).reduce((a, b) => a + b, 0);
    }

    getAnswerAmount(): number {
        return this.gameService.filterPlayers().filter((player) => player.answers?.hasConfirmed).length;
    }

    nextQuestion(): void {
        if (this.currentQuestion < this.answers.choices.length - 1) {
            this.currentQuestion++;
        }
    }

    previousQuestion(): void {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
        }
    }

    getQuestion(): Question | undefined {
        return this.answers.questions[this.currentQuestion];
    }

    ngOnInit(): void {
        this.subscriptions.push(
            this.gameService.players.subscribe((players) => {
                this.players = players;
            }),
        );

        this.subscriptions.push(
            this.gameService.answers.subscribe((answers) => {
                this.answers = answers;
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}
