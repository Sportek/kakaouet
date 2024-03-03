import { Component } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { GameUser } from '@common/types';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    message: string;
    constructor(public gameService: GameService) {}

    getGameUser(userId: string): GameUser | null {
        if (this.gameService.game) {
            // _id de mongo de base, accepté par le prof.
            // eslint-disable-next-line no-underscore-dangle
            return this.gameService.game?.users.filter((user) => user._id === userId)[0];
        }

        return null;
    }

    sendMessage() {
        this.gameService.sendMessage(this.message);
        this.message = '';
    }
}
