import { Injectable } from '@angular/core';
import { sortPlayerByName } from '@app/classes/utils';
import { GameService } from '@app/services/game/game.service';
import { Variables } from '@common/enum-variables';
import { ActualQuestion, ChoiceData, PlayerClient } from '@common/game-types';
import { QuestionType } from '@common/types';
import { cloneDeep } from 'lodash';

export const baseQRLRatings = [
    { text: '0', amount: 0, isCorrect: true },
    { text: '0.5', amount: 0, isCorrect: true },
    { text: '1', amount: 0, isCorrect: true },
];

@Injectable({
    providedIn: 'root',
})
export class OrganisatorService {
    actualQuestion: ActualQuestion | null;
    choices: ChoiceData[];
    playerRatings: Map<string, number> = new Map<string, number>();
    players: PlayerClient[];
    currentPlayer: PlayerClient;
    currentPlayerIndex: number;
    histogram: { hasModified: number; hasNotModified: number };

    constructor(private gameService: GameService) {
        this.actualQuestion = null;
        this.choices = [];
        this.players = [];
        this.histogram = { hasModified: 0, hasNotModified: 0 };
    }

    rateAnswerQRL(playerName: string, currentRating: string) {
        this.choices.forEach((choice) => {
            if (parseFloat(choice.text) * (this.actualQuestion?.question.points ?? 0) === this.playerRatings.get(playerName)) choice.amount--;
            if (choice.text === currentRating) choice.amount++;
        });
        this.playerRatings.set(playerName, (this.actualQuestion?.question.points ?? 0) * parseFloat(currentRating));
    }

    sendRating(playerName: string) {
        this.players = this.filterPlayers();
        this.gameService.rateAnswerQRL(playerName, this.playerRatings.get(playerName) ?? 0);
        if (this.currentPlayerIndex + 1 < this.players.length) this.currentPlayer = this.players[++this.currentPlayerIndex];
    }

    filterPlayers(): PlayerClient[] {
        return this.gameService.filterPlayers().filter((player) => !player.hasGiveUp);
    }

    calculateChoices() {
        if (this.actualQuestion?.question?.type === QuestionType.QCM) {
            this.choices = this.actualQuestion?.question.choices.map((choice, index) => {
                const amount = this.gameService.filterPlayers().filter((player) => {
                    if (!player.answers) return false;
                    return (player.answers.answer as number[]).includes(index);
                }).length;
                return { text: choice.text, amount, isCorrect: choice.isCorrect };
            });
        }
    }

    setActualQuestion(actualQuestion: ActualQuestion | null) {
        this.actualQuestion = actualQuestion;
        if (this.actualQuestion?.question?.type === QuestionType.QRL) {
            this.choices = cloneDeep(baseQRLRatings);
        }
        this.calculateChoices();
    }

    setPlayers(players: PlayerClient[]) {
        this.players = sortPlayerByName(players);
        this.players = this.filterPlayers();
        this.currentPlayer = this.players[0];
        this.currentPlayerIndex = 0;
        this.calculateChoices();
    }

    calculateHistogram(cooldown: number) {
        this.histogram.hasNotModified = 0;
        this.histogram.hasModified = 0;
        for (const player of this.players) {
            const interactionTime = this.gameService.recentInteractions.get(player.name);
            if (interactionTime && interactionTime - cooldown <= Variables.HistrogramCooldown) {
                this.histogram.hasModified++;
            } else {
                this.histogram.hasNotModified++;
            }
        }
    }
}
