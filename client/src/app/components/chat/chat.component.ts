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
        return this.gameService.game?.users.filter((user) => user.id === userId)[0];
    }

    sendMessage() {
        // TODO: Envoyer le message au backend
    }
}
