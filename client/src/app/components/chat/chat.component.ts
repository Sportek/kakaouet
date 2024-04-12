import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ChatService } from '@app/services/chat/chat.service';
import { INTERVAL_MESSAGES } from '@common/constants';
import { Message } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
    @ViewChild('chat') chatElement: ElementRef;

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
        window.setTimeout(() => {
            this.chatElement.nativeElement.scrollTo(0, this.chatElement.nativeElement.scrollHeight);
        }, INTERVAL_MESSAGES);
    }
}
