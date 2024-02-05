import { Component } from '@angular/core';
import { GameService } from '@app/services/game/game.service';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    message: string;
    constructor(public gameService: GameService) {}

    getGameUser(userId: string) {
        // _id de mongo de base, accepté par le prof.
        // eslint-disable-next-line no-underscore-dangle
        return this.gameService.game?.users.filter((user) => user._id === userId)[0];
    }

    sendMessage() {
        // TODO: Envoyer le message au backend
    }
}
