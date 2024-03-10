import { TestBed } from '@angular/core/testing';

import { NotificationService } from '@app/services/notification/notification.service';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let mockNotificationService: jasmine.SpyObj<NotificationService>;

    beforeEach(() => {
        mockNotificationService = jasmine.createSpyObj('NotificationService', ['error']);
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: NotificationService,
                    useValue: mockNotificationService,
                },
            ],
        });
        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
