import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game/game.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { SocketService } from '@app/services/socket/socket.service';
import { GAME_CODE_CHARACTERS, GAME_CODE_LENGTH } from '@common/constants';
import { GameEvents, GameEventsData } from '@common/game-types';
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
    ) {
        this.listenerConfirmJoinGame();
    }

    join(code: string, name: string): void {
        if (!this.confirmCodeValidity(code)) return;
        this.gameService.initialise();
        this.socketService.send(GameEvents.JoinGame, { code, name });
        this.gameService.client.next({ name, role: GameRole.Player, score: 0 });
    }

    private listenerConfirmJoinGame(): void {
        this.socketService.listen(GameEvents.PlayerConfirmJoinGame, (data: GameEventsData.PlayerConfirmJoinGame) => {
            if (data.isSuccess) {
                this.router.navigateByUrl('/waiting-room/' + data.code);
                this.gameService.players.next(data.players);
                this.gameService.game.next(data.game);
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
}
