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

    sendMessage() {
        this.gameService.sendMessage(this.message);
        this.message = '';
    }
}
