import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { OrganisatorService } from '@app/services/organisator/organisator.service';
import { PlayerService } from '@app/services/player/player.service';
import { ActualQuestion, ChoiceData, PlayerClient, SortOrder, SortingCriteria } from '@common/game-types';
import { GameState, QuestionType } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-organisator',
    templateUrl: './organisator.component.html',
    styleUrls: ['./organisator.component.scss'],
})
export class OrganisatorComponent implements OnInit, OnDestroy {
    cooldown: number;
    players: PlayerClient[];
    choices: ChoiceData[];
    timerIsRunning: boolean;
    currentRating: string;
    selectedCriterion: SortingCriteria = SortingCriteria.name;
    sortingOrder: SortOrder = SortOrder.ascending;
    sortingCriteria = SortingCriteria;
    sortOrder = SortOrder;
    currentQuestion: number;
    private subscriptions: Subscription[];

    constructor(
        private gameService: GameService,
        private playerService: PlayerService,
        private organisatorService: OrganisatorService,
    ) {
        this.cooldown = 0;
        this.timerIsRunning = true;
        this.subscriptions = [];
        this.currentRating = '';
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
                this.organisatorService.calculateHistogram(cooldown);
            }),
        );

        this.subscriptions.push(
            this.gameService.players.subscribe((players) => {
                this.players = players;
                this.organisatorService.setPlayers(players);
                this.sortPlayers();
                this.calculateChoices();
            }),
        );
    }

    // to finish
    calculatePercentage(amount: number): number {
        return (
            amount /
            this.getChoices()
                .map((data) => data.amount)
                .reduce((a, b) => a + b, 0)
        );
    }

    // done
    getAnswerAmount(): number {
        return this.gameService.filterPlayers().filter((player) => player.answers?.hasConfirmed).length;
    }

    // done
    filterPlayers(): PlayerClient[] {
        return this.organisatorService.filterPlayers();
    }

    // done
    getPlayers(): string[] {
        return this.getPlayerArray().map((player) => player.name);
    }

    // done
    isCorrectingAnswers(): boolean {
        return this.gameService.gameState.getValue() === GameState.OrganisatorCorrectingAnswers;
    }

    // done
    rateAnswerQRL(playerName: string): void {
        this.organisatorService.rateAnswerQRL(playerName, this.currentRating);
    }

    // done
    sendRating(playerName: string) {
        this.organisatorService.sendRating(playerName);
        this.currentRating = '';
    }

    // done
    getRatingForPlayer(playerName: string): number | undefined {
        return this.getPlayerRatings().get(playerName);
    }

    // done
    formatColumn(column: ChoiceData): string {
        return parseFloat(column.text).toLocaleString('en', { style: 'percent' });
    }

    // done
    calculateChoices(): void {
        this.organisatorService.calculateChoices();
    }

    // done
    toggleTimer(): void {
        this.gameService.toggleTimer();
        this.timerIsRunning = !this.timerIsRunning;
    }

    // done
    speedUpTimer(): void {
        this.gameService.speedUpTimer();
    }

    // done
    nextQuestion(): void {
        this.gameService.nextQuestion();
    }

    // done
    toggleMutePlayer(player: PlayerClient) {
        this.gameService.toggleMutePlayer(player);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    // done
    isLastQuestion(): boolean {
        return this.gameService.isLastQuestion();
    }

    // done
    isQRL(): boolean {
        return this.gameService.actualQuestion.getValue()?.question.type === QuestionType.QRL;
    }

    // done
    isDisplayingResults(): boolean {
        return this.gameService.gameState.getValue() === GameState.DisplayQuestionResults;
    }

    // to finish
    isAnsweringQRL(): boolean {
        return (
            this.gameService.gameState.getValue() === GameState.PlayersAnswerQuestion && this.getActualQuestion()?.question.type === QuestionType.QRL
        );
    }

    // done
    getActualQuestion(): ActualQuestion | null {
        return this.organisatorService.actualQuestion;
    }

    // done
    getPlayerArray(): PlayerClient[] {
        return this.organisatorService.players;
    }

    // done
    getChoices(): ChoiceData[] {
        return this.organisatorService.choices;
    }

    // done
    getPlayerRatings(): Map<string, number> {
        return this.organisatorService.playerRatings;
    }

    // done
    getHistogram(): { hasModified: number; hasNotModified: number } {
        return this.organisatorService.histogram;
    }

    // done
    getCurrentPlayer(): PlayerClient {
        return this.organisatorService.currentPlayer;
    }

    // done
    sortPlayers(): void {
        this.players = this.playerService.sortPlayers(this.players, this.selectedCriterion, this.sortingOrder);
    }

    // done
    toggleSortOrder(): void {
        this.sortingOrder = this.sortingOrder === this.sortOrder.ascending ? this.sortOrder.descending : this.sortOrder.ascending;
        this.sortPlayers();
    }
}
