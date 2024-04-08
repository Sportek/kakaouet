/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { sortPlayerByName } from '@app/classes/utils';
import { GameService } from '@app/services/game/game.service';
import { ActualQuestion, ChoiceData, PlayerClient } from '@common/game-types';
import { GameState, QuestionType } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-organisator',
    templateUrl: './organisator.component.html',
    styleUrls: ['./organisator.component.scss'],
})
export class OrganisatorComponent implements OnInit, OnDestroy {
    actualQuestion: ActualQuestion | null;
    cooldown: number;
    players: PlayerClient[];
    choices: ChoiceData[];
    timerIsRunning;
    currentPlayer: PlayerClient;
    currentPlayerIndex: number;
    currentRating: string = '';
    playerRatings: Map<string, number> = new Map<string, number>();

    // for QRL
    selectedResponseQRL: string | null = null;
    // for QRL
    playersQRL: string | undefined;
    // for QRL
    interactedCount: number = 0;
    // for QRL
    notInteractedCount: number = 0;
    // for QRL
    interactedHeight: number = 0; // pour l'histogramme
    // for QRL
    notInteractedHeight: number = 0; // pour l'histogramme
    // for QRL
    itsTime: boolean = false;

    // for QRL
    histogram = { hasModified: 0, hasNotModified: 0 };

    currentQuestion: number;
    private subscriptions: Subscription[];

    constructor(
        private gameService: GameService, // private router: Router,
    ) {
        this.actualQuestion = null;
        this.cooldown = 0;
        this.players = [];
        this.choices = [];
        this.timerIsRunning = true;
        this.subscriptions = [];
        this.currentQuestion = 0;
    }

    calculatePercentage(amount: number): number {
        return amount / this.choices.map((data) => data.amount).reduce((a, b) => a + b, 0);
    }

    getAnswerAmount(): number {
        return this.gameService.filterPlayers().filter((player) => player.answers?.hasConfirmed).length;
    }

    // for QRL
    getPlayers(): string[] {
        return this.players.map((player) => player.name);
    }

    // for QRL
    isCorrectingAnswers(): boolean {
        return this.gameService.gameState.getValue() === GameState.OrganisatorCorrectingAnswers;
    }

    // for QRL
    rateAnswerQRL(playerName: string): void {
        const questionPoints = this.actualQuestion?.question.points ?? 0; // car potentiellement undefined
        const score: number = questionPoints * parseFloat(this.currentRating);
        this.choices.forEach((choice) => {
            if (parseFloat(choice.text) * questionPoints === this.playerRatings.get(playerName)) choice.amount--;
            if (choice.text === this.currentRating) choice.amount++;
        });
        this.playerRatings.set(playerName, score);
    }

    // for QRL
    sendRating(playerName: string) {
        this.gameService.rateAnswerQRL(playerName, this.playerRatings.get(playerName) ?? 0);
        if (this.currentPlayerIndex + 1 < this.players.length) this.currentPlayer = this.players[++this.currentPlayerIndex];
        this.currentRating = '';
    }

    // for QRL
    getRatingForPlayer(playerName: string): number | undefined {
        return this.playerRatings.get(playerName);
    }

    formatColumn(column: ChoiceData): string {
        return parseFloat(column.text) * 100 + '%';
    }

    calculateChoices(): void {
        if (this.actualQuestion?.question?.type === QuestionType.QCM) {
            this.choices = this.actualQuestion.question.choices.map((choice, index) => {
                const amount = this.gameService.filterPlayers().filter((player) => {
                    if (!player.answers) return false;
                    return (player.answers.answer as number[]).includes(index);
                }).length;
                return { text: choice.text, amount, isCorrect: choice.isCorrect };
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
            this.gameService.actualQuestion.subscribe((actualQuestion) => {
                this.actualQuestion = actualQuestion;
                if (this.actualQuestion?.question?.type === QuestionType.QRL) {
                    this.choices = [
                        { text: '0', amount: 0, isCorrect: true },
                        { text: '0.5', amount: 0, isCorrect: true },
                        { text: '1', amount: 0, isCorrect: true },
                    ];
                }
                this.calculateChoices();
            }),
        );

        this.subscriptions.push(
            this.gameService.cooldown.subscribe((cooldown) => {
                this.cooldown = cooldown;
                this.histogram.hasNotModified = 0;
                this.histogram.hasModified = 0;
                this.calculateHistogram();
            }),
        );

        this.subscriptions.push(
            this.gameService.players.subscribe((players) => {
                this.players = sortPlayerByName(players);
                this.currentPlayer = players[0];
                this.currentPlayerIndex = 0;
                this.calculateChoices();
            }),
        );
    }

    filterPlayers(): PlayerClient[] {
        return this.gameService.filterPlayers();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    isLastQuestion(): boolean {
        return this.gameService.isLastQuestion();
    }

    calculateHistogram() {
        for (const player of this.players) {
            const interactionTime = this.gameService.recentInteractions.get(player.name);
            if (interactionTime && interactionTime - this.cooldown <= 5) {
                this.histogram.hasModified++;
            } else {
                this.histogram.hasNotModified++;
            }
        }
    }

    // for QRL
    isQRL(): boolean {
        return this.gameService.actualQuestion.getValue()?.question.type === QuestionType.QRL;
    }

    // for QRL
    isDisplayingResults(): boolean {
        return this.gameService.gameState.getValue() === GameState.DisplayQuestionResults;
    }

    // for QRL
    isAnsweringQRL(): boolean {
        return this.gameService.gameState.getValue() === GameState.PlayersAnswerQuestion && this.actualQuestion?.question.type === QuestionType.QRL;
    }
}
