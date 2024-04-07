import { Component, OnDestroy, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
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

    // for QRL
    selectedResponseQRL: string | null = null;
    // for QRL
    playersQRL: string | undefined;
    // for QRL
    playerRatings: { [key: string]: number } = {};

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
    getAnswerQRL(): { name: string; answer: string }[] {
        const responses: { name: string; answer: string }[] = [];
        if (this.actualQuestion?.question.type === QuestionType.QRL) {
            for (const player of this.players) {
                const answer = player.answers?.answer;
                if (typeof answer === 'string') {
                    responses.push({ name: player.name, answer });
                }
            }
        }
        return responses.sort((playerA, playerB) => playerA.name.localeCompare(playerB.name));
    }

    // for QRL
    getPlayers(): string[] {
        return this.getAnswerQRL().map((player) => player.name);
    }

    // for QRL
    selectPlayer(name: string): void {
        const player = this.getAnswerQRL().find((p) => p.name === name);
        this.playersQRL = player?.name;
        this.selectedResponseQRL = player ? player.answer : null;
    }

    // for QRL
    isCorrectingAnswers(): boolean {
        return this.gameService.gameState.getValue() === GameState.OrganisatorCorrectingAnswers;
    }

    // for QRL
    rateAnswerQRL(playerName: string, rating: string): void {
        console.log(playerName, rating);
        const questionPoints = this.actualQuestion?.question.points ?? 0; // car potentiellement undefined
        const score = questionPoints * parseInt(rating, 10);
        this.gameService.rateAnswerQRL(playerName, score);
        switch (rating) {
            case '0':
                this.choices[0].amount++;
                break;
            case '0.5':
                this.choices[1].amount++;
                break;
            case '1':
                this.choices[2].amount++;
                break;
            default:
                break;
        }
        console.log(this.choices);
    }

    // for QRL
    allPlayersRated(): boolean {
        const players = this.getAnswerQRL();
        return players.every((player) => this.playerRatings[player.name] !== undefined);
    }

    // for QRL
    getRatingForPlayer(playerName: string): number | undefined {
        return this.playerRatings[playerName];
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
        console.log('oragnisator');
        this.gameService.nextQuestion();
    }

    ngOnInit(): void {
        this.subscriptions.push(
            this.gameService.actualQuestion.subscribe((actualQuestion) => {
                this.actualQuestion = actualQuestion;
                if (actualQuestion?.question.type === QuestionType.QRL) {
                    this.choices = [
                        { text: '0%', amount: 0, isCorrect: true },
                        { text: '50%', amount: 0, isCorrect: true },
                        { text: '100%', amount: 0, isCorrect: true },
                    ];
                }
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

    filterPlayers(): PlayerClient[] {
        return this.gameService.filterPlayers();
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
}
