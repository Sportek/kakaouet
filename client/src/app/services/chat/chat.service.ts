import { Injectable } from '@angular/core';
import { SocketService } from '@app/services/socket/socket.service';
import { GameEvents, GameEventsData } from '@common/game-types';
import { Message } from '@common/types';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private messageHistory: BehaviorSubject<Message[]>;

    constructor(private socketService: SocketService) {
        this.listenChatMessages();
        this.initialize();
    }

    initialize() {
        this.messageHistory = new BehaviorSubject<Message[]>([]);
    }

    sendMessage(content: string) {
        this.socketService.send(GameEvents.SendMessage, { content });
    }

    listenChatMessages() {
        this.socketService.listen(GameEvents.PlayerSendMessage, (data: GameEventsData.PlayerSendMessage) => {
            this.messageHistory.next([...this.messageHistory.getValue(), data]);
        });
    }

    getMessageHistory(): Observable<Message[]> {
        return this.messageHistory.asObservable();
    }
}
