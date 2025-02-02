import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game/game.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { SocketService } from '@app/services/socket/socket.service';
import { SoundService } from '@app/services/sound/sound.service';
import { GAME_CODE_CHARACTERS, GAME_CODE_LENGTH, GAME_USERNAME_MAX_LENGTH } from '@common/constants';
import { GameEvents, GameEventsData, SoundType } from '@common/game-types';
import { GameRole } from '@common/types';

@Injectable({
    providedIn: 'root',
})
export class JoinService {
    // eslint-disable-next-line max-params -- Ils sont nécessaires
    constructor(
        private notificationService: NotificationService,
        private socketService: SocketService,
        private router: Router,
        private gameService: GameService,
        private soundService: SoundService,
    ) {
        this.listenerConfirmJoinGame();
    }

    join(code: string, name: string): void {
        if (!this.confirmCodeValidity(code)) return;
        if (!this.confirmUsernameValidity(name)) return;
        this.gameService.initialise();
        this.socketService.send(GameEvents.JoinGame, { code, name: name.trim() });
        this.gameService.client.next({ name, role: GameRole.Player, score: 0 });
    }

    private listenerConfirmJoinGame(): void {
        this.socketService.listen(GameEvents.PlayerConfirmJoinGame, (data: GameEventsData.PlayerConfirmJoinGame) => {
            if (data.isSuccess) {
                this.router.navigateByUrl('/waiting-room/' + data.code);
                this.gameService.players.next(data.players);
                this.gameService.game.next(data.game);
                this.soundService.startPlayingSound(SoundType.PlayingRoom, true);
                return;
            }

            this.notificationService.error(data.message);
        });
    }

    private confirmCodeValidity(code: string): boolean {
        const error = this.confirmCodeSyntax(code);
        if (error) this.notificationService.error(error);
        return !error;
    }

    private confirmCodeSyntax(code: string): string {
        if (code.length !== GAME_CODE_LENGTH) {
            return `Le code doit être de ${GAME_CODE_LENGTH} caractères.`;
        } else if (!code.split('').every((char) => GAME_CODE_CHARACTERS.includes(char))) {
            return 'Le code ne peut contenir que les caractères suivants: ' + GAME_CODE_CHARACTERS.split('').join(', ') + '.';
        } else return '';
    }

    private confirmUsernameValidity(name: string): boolean {
        const error = this.confirmUsernameSyntax(name);
        if (error) this.notificationService.error(error);
        return !error;
    }

    private confirmUsernameSyntax(name: string): string {
        if (name.length > GAME_USERNAME_MAX_LENGTH) {
            return `Le nom d'utilisateur doit être plus petit ou égal à ${GAME_USERNAME_MAX_LENGTH} caractères.`;
        }
        if (name.length === 0 || name.trim().length === 0) {
            return "Le nom d'utilisateur ne peut pas être vide.";
        }
        return '';
    }
}
