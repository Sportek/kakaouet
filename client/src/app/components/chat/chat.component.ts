import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service';
import { Message } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
    messages: Message[];
    message: string;

    subscribers: Subscription[];

    constructor(public chatService: ChatService) {
        this.messages = [];
        this.message = '';
        this.subscribers = [];
    }

    ngOnInit(): void {
        this.subscribers.push(
            this.chatService.getMessageHistory().subscribe({
                next: (messageHistory) => {
                    this.messages = messageHistory;
                },
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscribers.forEach((subscriber) => {
            subscriber.unsubscribe();
        });
    }

    sendMessage() {
        this.chatService.sendMessage(this.message);
        this.message = '';
    }
}
