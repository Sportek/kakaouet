import { Injectable } from '@angular/core';
import { NotificationService } from '@app/services/notification/notification.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Variables } from '@common/enum-variables';
import { GameEvents, GameEventsData } from '@common/game-types';
import { Message } from '@common/types';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private messageHistory: BehaviorSubject<Message[]>;

    constructor(
        private socketService: SocketService,
        private notificationService: NotificationService,
    ) {
        this.listenChatMessages();
        this.initialize();
    }

    initialize(): void {
        this.messageHistory = new BehaviorSubject<Message[]>([]);
    }

    sendMessage(content: string): void {
        content = content.trim();
        if (content.length > Variables.MaxCharacters)
            return this.notificationService.error(`Vous ne pouvez pas envoyer plus de ${Variables.MaxCharacters} caractères.`);
        if (!content.length) return this.notificationService.error('Vous ne pouvez pas envoyer un message vide.');
        this.socketService.send(GameEvents.SendMessage, { content });
    }

    listenChatMessages(): void {
        this.socketService.listen(GameEvents.PlayerSendMessage, (data: GameEventsData.PlayerSendMessage) => {
            this.messageHistory.next([...this.messageHistory.getValue(), data]);
        });
    }

    getMessageHistory(): Observable<Message[]> {
        return this.messageHistory.asObservable();
    }
}
