import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '@app/services/notification/notification.service';
import { ActualQuestion, Answer, Client, GameEventsData, InteractionStatus, PlayerClient } from '@common/game-types';
import { QuestionType } from '@common/types';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class SocketEventHandlerService {
    constructor(
        private router: Router,
        private notificationService: NotificationService,
    ) {}

    handlePlayerGivesUp(data: GameEventsData.PlayerHasGiveUp, players: BehaviorSubject<PlayerClient[]>): void {
        players.next(
            players.getValue().map((player) => {
                if (player.name === data.name) {
                    player.interactionStatus = InteractionStatus.abandoned;
                    player.hasGiveUp = true;
                }
                return player;
            }),
        );
    }

    handlePlayerBanned(data: GameEventsData.PlayerBanned, players: BehaviorSubject<PlayerClient[]>, client: BehaviorSubject<Client>) {
        players.next(players.getValue().map((player) => (player.name === data.name ? { ...player, isExcluded: true } : player)));
        if (data.name === client.getValue().name) {
            this.router.navigateByUrl('/home', { replaceUrl: true });
            this.notificationService.error('Vous avez été banni de la partie');
        }
    }

    handlePlayerMuted(data: GameEventsData.PlayerMuted, players: BehaviorSubject<PlayerClient[]>, client: BehaviorSubject<Client>) {
        players.next(players.getValue().map((player) => (player.name === data.name ? { ...player, isMuted: data.isMuted } : player)));
        if (data.name === client.getValue().name) {
            if (data.isMuted) {
                this.notificationService.error("Vous n'avez pas droit de clavarder");
            } else {
                this.notificationService.error('Vous avez le droit de clavarder a nouveau');
            }
        }
    }

    handleUpdateScore(data: GameEventsData.UpdateScore, client: BehaviorSubject<Client>) {
        if (data.hasAnsweredFirst) this.notificationService.info('Vous avez répondu en premier !');
        client.next({ ...client.getValue(), score: data.score });
    }

    handlePlayerConfirmAnswers(data: GameEventsData.PlayerConfirmAnswers, players: BehaviorSubject<PlayerClient[]>) {
        const player = players.getValue().find((p) => p.name === data.name);
        if (player) {
            if (player.answers) {
                player.interactionStatus = InteractionStatus.finalized;
                player.answers.hasConfirmed = true;
            }
            players.next([...players.getValue()]);
        }
    }

    handlePlayerSelectAnswer(data: GameEventsData.PlayerSelectAnswer, players: BehaviorSubject<PlayerClient[]>) {
        const player = players.getValue().find((p) => p.name === data.name);
        if (player) {
            player.answers = { hasInterracted: true, hasConfirmed: false, answer: data.answer };
            player.interactionStatus = InteractionStatus.interacted;
            players.next([...players.getValue()]);
        }
    }

    // eslint-disable-next-line max-params -- tous les params sont utilisés
    handleGameQuestion(
        data: GameEventsData.GameQuestion,
        actualQuestion: BehaviorSubject<ActualQuestion | null>,
        answer: BehaviorSubject<Answer | null>,
        isFinalAnswer: BehaviorSubject<boolean>,
    ) {
        actualQuestion.next(data.actualQuestion);
        answer.next(data.actualQuestion.question.type === QuestionType.QCM ? [] : '');
        isFinalAnswer.next(false);
    }

    handleGameClosed() {
        this.router.navigateByUrl('/home', { replaceUrl: true });
        this.notificationService.success('La partie a été fermée');
    }

    handlePlayerJoinGame(data: GameEventsData.PlayerJoinGame, players: BehaviorSubject<PlayerClient[]>) {
        players.next([
            ...players.getValue(),
            {
                name: data.name,
                role: data.role,
                isExcluded: data.isExcluded,
                score: data.score,
                hasGiveUp: data.hasGiveUp,
                isMuted: data.isMuted,
                interactionStatus: InteractionStatus.noInteraction,
            },
        ]);
    }

    handleSendPlayerScores(data: GameEventsData.SendPlayersScores, players: BehaviorSubject<PlayerClient[]>) {
        players.next(
            players.getValue().map((player) => {
                const score = data.scores.find((s) => s.name === player.name);
                if (score) player.score = score.score;
                return player;
            }),
        );
    }
}
