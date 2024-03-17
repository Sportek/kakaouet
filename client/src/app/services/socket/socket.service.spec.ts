import { TestBed } from '@angular/core/testing';

import { NotificationService } from '@app/services/notification/notification.service';
import { SocketService } from './socket.service';

describe('SocketService', () => {
    let service: SocketService;
    let notificationServiceMocked: jasmine.SpyObj<NotificationService>;

    beforeEach(() => {
        notificationServiceMocked = jasmine.createSpyObj('NotificationService', ['info']);
        TestBed.configureTestingModule({
            providers: [{ provide: NotificationService, useValue: notificationServiceMocked }],
        });
        service = TestBed.inject(SocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
