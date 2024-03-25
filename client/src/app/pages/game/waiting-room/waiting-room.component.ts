import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { NEGATIVE_SCORE } from '@common/constants';
import { Client, GameRestricted, PlayerClient } from '@common/game-types';
import { GameRole, GameType } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
    players: PlayerClient[];
    isLocked: boolean;
    isOrganizer: boolean;
    client: Client;
    game: GameRestricted;
    isCooldownStarted: boolean;
    cooldown: number;
    private subscriptions: Subscription[];
    constructor(private gameService: GameService) {
        this.players = [];
        this.isLocked = false;
        this.isOrganizer = false;
        this.client = { name: '', role: GameRole.Player, score: 0 };
        this.game = { code: '', quizName: '', type: GameType.Default };
        this.isCooldownStarted = false;
        this.cooldown = NEGATIVE_SCORE;
        this.subscriptions = [];
    }

    start() {
        this.gameService.startGame();
    }

    changeLockState() {
        this.gameService.changeLockState();
    }

    banPlayer(player: PlayerClient) {
        this.gameService.banPlayer(player);
    }

    mutePlayer(player: PlayerClient) {
        this.gameService.mutePlayer(player);
    }

    filterPlayers(): PlayerClient[] {
        return this.gameService.filterPlayers();
    }

    ngOnInit() {
        this.subscriptions.push(
            this.gameService.players.subscribe((players) => {
                this.players = players.filter((player) => player.role === GameRole.Player);
            }),
        );

        this.subscriptions.push(
            this.gameService.client.subscribe((client) => {
                this.client = client;
                this.isOrganizer = client.role === GameRole.Organisator;
            }),
        );

        this.subscriptions.push(
            this.gameService.cooldown.subscribe((cooldown) => {
                this.cooldown = cooldown;
                this.isCooldownStarted = cooldown >= 0;
            }),
        );

        this.subscriptions.push(
            this.gameService.game.subscribe((game) => {
                this.game = game;
            }),
        );

        this.subscriptions.push(
            this.gameService.isLocked.subscribe((isLocked) => {
                this.isLocked = isLocked;
            }),
        );
    }

    ngOnDestroy() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}
