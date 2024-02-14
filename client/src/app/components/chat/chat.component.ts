import { Component } from '@angular/core';
import { GameService } from '@app/services/game/game.service';
import { AnswerState, GameRole, GameUser } from '@common/types';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
    message: string;
    constructor(public gameService: GameService) {}

    getGameUser(userId: string): GameUser {
        if (this.gameService.game) {
            // _id de mongo de base, accepté par le prof.
            // eslint-disable-next-line no-underscore-dangle
            const gameUser = this.gameService.game?.users.filter((user) => user._id === userId)[0];
            if (gameUser) return gameUser;
        }

        return {
            _id: '',
            name: '',
            score: 0,
            // If user is excluded from the game (cannot join again)
            isExcluded: false,
            // If user is currently active in the game (is still connected)
            isActive: false,
            answerState: AnswerState.Waiting,
            role: GameRole.Player,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    }

    sendMessage() {
        this.gameService.sendMessage(this.message);
        this.message = '';
    }
}
