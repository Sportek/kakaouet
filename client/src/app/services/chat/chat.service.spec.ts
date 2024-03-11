import { TestBed } from '@angular/core/testing';
import { NotificationService } from '@app/services/notification/notification.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Variables } from '@common/enum-variables';
import { GameEvents } from '@common/game-types';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let mockNotificationService: jasmine.SpyObj<NotificationService>;
    let mockSocketService: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        mockNotificationService = jasmine.createSpyObj('NotificationService', ['error']);
        mockSocketService = jasmine.createSpyObj('SocketService', ['send', 'listen']);

        TestBed.configureTestingModule({
            providers: [
                ChatService,
                { provide: NotificationService, useValue: mockNotificationService },
                { provide: SocketService, useValue: mockSocketService },
            ],
        });

        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize message history', () => {
        service.initialize();
        service.getMessageHistory().subscribe((history) => {
            expect(history).toEqual([]);
        });
    });

    it('should send a message if content is valid', () => {
        const validContent = 'Hello World';
        service.sendMessage(validContent);
        expect(mockSocketService.send).toHaveBeenCalledWith(GameEvents.SendMessage, { content: validContent });
    });

    it('should not send a message if content exceeds max characters', () => {
        const longContent = 'a'.repeat(Variables.MaxCharacters + 1);
        service.sendMessage(longContent);
        expect(mockSocketService.send).not.toHaveBeenCalled();
        expect(mockNotificationService.error).toHaveBeenCalledWith(`Vous ne pouvez pas envoyer plus de ${Variables.MaxCharacters} caractères.`);
    });

    it('should not send an empty message', () => {
        const emptyContent = '';
        service.sendMessage(emptyContent);
        expect(mockSocketService.send).not.toHaveBeenCalled();
        expect(mockNotificationService.error).toHaveBeenCalledWith('Vous ne pouvez pas envoyer un message vide.');
    });

    it('should listen and store chat messages', () => {
        const testMessage = {
            name: 'Test User',
            content: 'Test message',
            createdAt: new Date(),
        };

        // eslint-disable-next-line @typescript-eslint/ban-types
        mockSocketService.listen.and.callFake((eventName, callback: Function) => {
            if (eventName === GameEvents.PlayerSendMessage) {
                callback(testMessage);
            }
        });

        service.listenChatMessages();

        service.getMessageHistory().subscribe((history) => {
            expect(history.length).toBeGreaterThan(0);
            expect(history[history.length - 1]).toEqual(
                jasmine.objectContaining({
                    name: 'Test User',
                    content: 'Test message',
                    createdAt: jasmine.any(Date),
                }),
            );
        });
    });
});
