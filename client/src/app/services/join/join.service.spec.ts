/* eslint-disable max-classes-per-file */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { GameService } from '@app/services/game/game.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { SocketService } from '@app/services/socket/socket.service';
import { GAME_CODE_CHARACTERS, GAME_USERNAME_MAX_LENGTH } from '@common/constants';
import { GameEvents } from '@common/game-types';
import { GameRole } from '@common/types';
import { JoinService } from './join.service';

class MockRouter {
    navigateByUrl = jasmine.createSpy('navigateByUrl').and.returnValue(Promise.resolve(true));
}

class MockGameService {
    initialise = jasmine.createSpy('initialise');
    client = { next: jasmine.createSpy('next') };
    players = { next: jasmine.createSpy('next') };
    game = { next: jasmine.createSpy('next') };
}

class MockNotificationService {
    error = jasmine.createSpy('error');
}

class MockSocketService {
    send = jasmine.createSpy('send');
    listen = jasmine.createSpy('listen').and.callFake((event, callback) => {
        if (event === GameEvents.PlayerConfirmJoinGame) {
            callback({ isSuccess: true, code: '1234', players: [], game: {} });
        }
    });
}

describe('JoinService', () => {
    let service: JoinService;
    let router: MockRouter;
    let gameService: MockGameService;
    let notificationService: MockNotificationService;
    let socketService: MockSocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                JoinService,
                { provide: Router, useClass: MockRouter },
                { provide: GameService, useClass: MockGameService },
                { provide: NotificationService, useClass: MockNotificationService },
                { provide: SocketService, useClass: MockSocketService },
            ],
        });
        service = TestBed.inject(JoinService);
        router = TestBed.inject(Router) as unknown as MockRouter;
        gameService = TestBed.inject(GameService) as unknown as MockGameService;
        notificationService = TestBed.inject(NotificationService) as unknown as MockNotificationService;
        socketService = TestBed.inject(SocketService) as unknown as MockSocketService;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize game service, send socket message, and update client if code is valid', () => {
        const validCode = '1234';
        const name = 'Test Player';

        service.join(validCode, name);

        expect(gameService.initialise).toHaveBeenCalled();
        expect(socketService.send).toHaveBeenCalledWith(GameEvents.JoinGame, { code: validCode, name });
        expect(gameService.client.next).toHaveBeenCalledWith({ name, role: GameRole.Player, score: 0 });
    });

    it('should not proceed and show error if code is too short', () => {
        const shortCode = '123';
        const name = 'Test Player';

        service.join(shortCode, name);

        expect(notificationService.error).toHaveBeenCalledWith('Le code doit être de 4 caractères.');
        expect(gameService.initialise).not.toHaveBeenCalled();
        expect(socketService.send).not.toHaveBeenCalled();
    });

    it('should not proceed and show error if code contains invalid characters', () => {
        const invalidCharsCode = '12A3';
        const name = 'Test Player';

        service.join(invalidCharsCode, name);

        expect(notificationService.error).toHaveBeenCalledWith(
            'Le code ne peut contenir que les caractères suivants: ' + GAME_CODE_CHARACTERS.split('').join(', ') + '.',
        );
        expect(gameService.initialise).not.toHaveBeenCalled();
        expect(socketService.send).not.toHaveBeenCalled();
    });

    it('should not proceed and show error if name contains more than 11 characters', () => {
        const validCoe = '1234';
        const veryLongName = 'Test player alfa';

        service.join(validCoe, veryLongName);

        expect(notificationService.error).toHaveBeenCalledWith(
            `Le nom d'utilisateur doit être plus petit ou égal à ${GAME_USERNAME_MAX_LENGTH} caractères.`,
        );
        expect(gameService.initialise).not.toHaveBeenCalled();
        expect(socketService.send).not.toHaveBeenCalled();
    });

    it('should not proceed and show error if name is empty', () => {
        const validCoe = '1234';
        const notValidUsername = '  ';

        service.join(validCoe, notValidUsername);

        expect(notificationService.error).toHaveBeenCalledWith("Le nom d'utilisateur ne peut pas être vide.");
        expect(gameService.initialise).not.toHaveBeenCalled();
        expect(socketService.send).not.toHaveBeenCalled();
    });

    describe('listenerConfirmJoinGame method', () => {
        it('should navigate to waiting room if player confirm join game is successful', () => {
            service['listenerConfirmJoinGame']();

            expect(router.navigateByUrl).toHaveBeenCalledWith('/waiting-room/1234');
        });

        it('should display an error if player confirm join game is unsuccessful', () => {
            socketService.listen.and.callFake((event, callback) => {
                if (event === GameEvents.PlayerConfirmJoinGame) {
                    callback({ isSuccess: false, message: 'Error joining game' });
                }
            });

            service['listenerConfirmJoinGame']();

            expect(notificationService.error).toHaveBeenCalledWith('Error joining game');
        });
    });
});
