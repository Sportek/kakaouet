import { Component, OnDestroy, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
import { GameService } from '@app/services/game/game.service';
import { ActualQuestion, ChoiceData, PlayerClient, SortOrder, SortingCriteria } from '@common/game-types';
import { QuestionType } from '@common/types';
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
    
  selectedCriterion: SortingCriteria = SortingCriteria.name;
  sortOrder: SortOrder = SortOrder.ascending;
  SortingCriteria = SortingCriteria;
  SortOrder = SortOrder;
    currentQuestion: number;
    private subscriptions: Subscription[];

    constructor(
        private gameService: GameService, 
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

    toggleMutePlayer(player: PlayerClient) {
        this.gameService.toggleMutePlayer(player);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }

    isLastQuestion(): boolean {
        return this.gameService.isLastQuestion();
    }

    sortPlayers(): void {
        this.players.sort((a, b) => {
          let comparison = 0;
      
          switch (this.selectedCriterion) {
            case SortingCriteria.name:
              comparison = a.name.localeCompare(b.name);
              break;
            case SortingCriteria.score:
              comparison = a.score - b.score;
              if (comparison === 0) {
                comparison = a.name.localeCompare(b.name);
              }
              break;
            case SortingCriteria.status:
              comparison = this.getStateValue(a) - this.getStateValue(b);
              if (comparison === 0) {
                comparison = a.name.localeCompare(b.name);
              }
              break;
          }
      
          if (this.sortOrder === SortOrder.descending) {
            comparison = -comparison;
          }
          return comparison;
        });
      }
      
    
      getStateValue(player: PlayerClient): number {
        const order = ['finalized', 'interacted', 'noInteraction', 'abandoned'];
        return order.indexOf(player.interactionStatus);
      }
    
      toggleSortOrder(): void {
        this.sortOrder = this.sortOrder === SortOrder.ascending ? SortOrder.descending : SortOrder.ascending;
        this.sortPlayers(); 
      }
}
