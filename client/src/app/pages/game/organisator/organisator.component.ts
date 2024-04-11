import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { OrganisatorService } from '@app/services/organisator/organisator.service';
import { ActualQuestion, ChoiceData, PlayerClient } from '@common/game-types';
import { GameState, QuestionType } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-organisator',
    templateUrl: './organisator.component.html',
    styleUrls: ['./organisator.component.scss'],
})
export class OrganisatorComponent implements OnInit, OnDestroy {
    cooldown: number;
    timerIsRunning: boolean;
    currentRating: string;
    private subscriptions: Subscription[];

    constructor(
        private gameService: GameService,
        private organisatorService: OrganisatorService,
    ) {
        this.cooldown = 0;
        this.timerIsRunning = true;
        this.subscriptions = [];
        this.currentRating = '';
    }

    calculatePercentage(amount: number): number {
        return (
            amount /
            this.getChoices()
                .map((data) => data.amount)
                .reduce((a, b) => a + b, 0)
        );
    }

    getAnswerAmount(): number {
        return this.gameService.filterPlayers().filter((player) => player.answers?.hasConfirmed).length;
    }

    filterPlayers(): PlayerClient[] {
        return this.organisatorService.filterPlayers();
    }

    getPlayers(): string[] {
        return this.getPlayerArray().map((player) => player.name);
    }

    isCorrectingAnswers(): boolean {
        return this.gameService.gameState.getValue() === GameState.OrganisatorCorrectingAnswers;
    }

    rateAnswerQRL(playerName: string): void {
        this.organisatorService.rateAnswerQRL(playerName, this.currentRating);
    }

    sendRating(playerName: string) {
        this.organisatorService.sendRating(playerName);
        this.currentRating = '';
    }

    getRatingForPlayer(playerName: string): number | undefined {
        return this.getPlayerRatings().get(playerName);
    }

    formatColumn(column: ChoiceData): string {
        return parseFloat(column.text).toLocaleString('en', { style: 'percent' });
    }

    calculateChoices(): void {
        this.organisatorService.calculateChoices();
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
                this.organisatorService.setActualQuestion(actualQuestion);
            }),
        );

        this.subscriptions.push(
            this.gameService.cooldown.subscribe((cooldown) => {
                this.cooldown = cooldown;
                this.organisatorService.calculateHistogram(cooldown);
            }),
        );

        this.subscriptions.push(
            this.gameService.players.subscribe((players) => {
                this.organisatorService.setPlayers(players);
            }),
        );
    }

    toggleMutePlayer(player: PlayerClient) {
        this.gameService.toggleMutePlayer(player);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    isLastQuestion(): boolean {
        return this.gameService.isLastQuestion();
    }

    isQRL(): boolean {
        return this.gameService.actualQuestion.getValue()?.question.type === QuestionType.QRL;
    }

    isDisplayingResults(): boolean {
        return this.gameService.gameState.getValue() === GameState.DisplayQuestionResults;
    }

    isAnsweringQRL(): boolean {
        return (
            this.gameService.gameState.getValue() === GameState.PlayersAnswerQuestion && this.getActualQuestion()?.question.type === QuestionType.QRL
        );
    }

    getActualQuestion(): ActualQuestion | null {
        return this.organisatorService.actualQuestion;
    }

    getPlayerArray(): PlayerClient[] {
        return this.organisatorService.players;
    }

    getChoices(): ChoiceData[] {
        return this.organisatorService.choices;
    }

    getPlayerRatings(): Map<string, number> {
        return this.organisatorService.playerRatings;
    }

    getHistogram(): { hasModified: number; hasNotModified: number } {
        return this.organisatorService.histogram;
    }

    getCurrentPlayer(): PlayerClient {
        return this.organisatorService.currentPlayer;
    }
}
