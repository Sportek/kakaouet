import { TestBed } from '@angular/core/testing';

import { Router } from '@angular/router';
import { GameService } from '@app/services/game/game.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { SocketService } from '@app/services/socket/socket.service';
import { JoinService } from './join.service';

describe('JoinService', () => {
    let service: JoinService;
    let notificationServiceMock: jasmine.SpyObj<NotificationService>;
    let socketServiceMock: jasmine.SpyObj<SocketService>;
    let routerMock: jasmine.SpyObj<Router>;
    let gameServiceMock: jasmine.SpyObj<GameService>;

    beforeEach(() => {
        notificationServiceMock = jasmine.createSpyObj('NotificationService', ['error']);
        socketServiceMock = jasmine.createSpyObj('SocketService', ['send', 'listen']);
        routerMock = jasmine.createSpyObj('Router', ['navigateByUrl']);
        gameServiceMock = jasmine.createSpyObj('GameService', ['initialise', 'client', 'players', 'game']);
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: NotificationService,
                    useValue: notificationServiceMock,
                },
                {
                    provide: SocketService,
                    useValue: socketServiceMock,
                },
                {
                    provide: Router,
                    useValue: routerMock,
                },
                {
                    provide: GameService,
                    useValue: gameServiceMock,
                },
            ],
        });
        service = TestBed.inject(JoinService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
