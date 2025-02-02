import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { OrganisatorService } from '@app/services/organisator/organisator.service';
import { PlayerService } from '@app/services/player/player.service';
import { Variables } from '@common/enum-variables';
import { ActualQuestion, ChoiceData, PlayerClient, SortingCriteria } from '@common/game-types';
import { GameState, Ordering, QuestionType } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-organisator',
    templateUrl: './organisator.component.html',
    styleUrls: ['./organisator.component.scss'],
})
export class OrganisatorComponent implements OnInit, OnDestroy {
    cooldown: number;
    players: PlayerClient[] = [];
    choices: ChoiceData[];
    timerIsRunning: boolean;
    currentRating: string;
    selectedCriterion: SortingCriteria = SortingCriteria.name;
    sortingOrder: Ordering = Ordering.ascending;
    sortingCriteria = SortingCriteria;
    sortOrder = Ordering;
    currentQuestion: number;
    histogram: { hasModified: number; hasNotModified: number };
    private subscriptions: Subscription[];

    constructor(
        private gameService: GameService,
        private playerService: PlayerService,
        private organisatorService: OrganisatorService,
    ) {
        this.histogram = { hasModified: 0, hasNotModified: 0 };
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
                this.organisatorService.playerRatings = new Map();
            }),
        );

        this.subscriptions.push(
            this.gameService.cooldown.subscribe((cooldown) => {
                this.cooldown = cooldown;
                this.players = this.players.filter((player) => !player.hasGiveUp);
                this.calculateHistogram(cooldown);
            }),
        );

        this.subscriptions.push(
            this.gameService.players.subscribe((players) => {
                this.players = players;
                this.players = this.filterPlayers();
                this.organisatorService.setPlayers(this.players);
                this.sortPlayers();
                this.calculateChoices();
            }),
        );

        this.subscriptions.push(
            this.gameService.gameState.subscribe((state) => {
                if (state === GameState.OrganisatorCorrectingAnswers) this.organisatorService.reinitialisePlayerToRate();
            }),
        );
    }

    calculateHistogram(cooldown: number) {
        this.histogram.hasNotModified = 0;
        this.histogram.hasModified = 0;
        for (const player of this.players) {
            if (player.hasGiveUp) return;
            const interactionTime = this.gameService.recentInteractions.get(player.name);
            if (interactionTime && interactionTime - cooldown <= Variables.HistrogramCooldown) {
                this.histogram.hasModified++;
            } else {
                this.histogram.hasNotModified++;
            }
        }
    }

    toggleMutePlayer(player: PlayerClient) {
        this.gameService.toggleMutePlayer(player);
    }

    canDisableTimer(): boolean {
        return this.gameService.gameState.getValue() === GameState.PlayersAnswerQuestion;
    }

    canGoToNextQuestion(): boolean {
        return this.gameService.gameState.getValue() === GameState.DisplayQuestionResults;
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
        return this.organisatorService.players.filter((player) => !player.hasGiveUp);
    }

    getChoices(): ChoiceData[] {
        return this.organisatorService.choices;
    }

    getPlayerRatings(): Map<string, number> {
        return this.organisatorService.playerRatings;
    }

    getHistogram(): { hasModified: number; hasNotModified: number } {
        return this.histogram;
    }

    getCurrentPlayer(): PlayerClient {
        return this.organisatorService.currentPlayer;
    }

    sortPlayers(): void {
        this.players = this.playerService.sortPlayers(this.players, this.selectedCriterion, this.sortingOrder);
    }

    toggleSortOrder(): void {
        this.sortingOrder = this.sortingOrder === this.sortOrder.ascending ? this.sortOrder.descending : this.sortOrder.ascending;
        this.sendSortedPlayers();
    }

    sendSortedPlayers() {
        this.sortPlayers();
        this.gameService.players.next(this.playerService.sortPlayers(this.gameService.players.getValue(), this.selectedCriterion, this.sortingOrder));
    }

    shouldDisplayQRLResults(): boolean {
        return this.isDisplayingResults() && this.isQRL();
    }

    shouldCorrectQRLAnswers(): boolean {
        return this.isCorrectingAnswers() && this.isQRL();
    }

    hasRatingForCurrentPlayer(): boolean {
        const currentPlayerName = this.getCurrentPlayer().name;
        const rating = this.getRatingForPlayer(currentPlayerName);
        return !!rating?.toString();
    }
}
