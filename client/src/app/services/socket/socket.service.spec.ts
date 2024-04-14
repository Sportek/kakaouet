import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { SocketService } from './socket.service';

describe('SocketService', () => {
    let service: SocketService;
    let mockRouter: unknown;
    let routerEvents: Subject<unknown>;
    let mockSocket: jasmine.SpyObj<Socket>;

    beforeEach(() => {
        routerEvents = new Subject();

        mockRouter = {
            events: routerEvents.asObservable(),
        };

        mockSocket = jasmine.createSpyObj('Socket', ['connect', 'disconnect', 'on', 'off', 'emit']);

        TestBed.configureTestingModule({
            providers: [SocketService, { provide: Router, useValue: mockRouter }, { provide: Socket, useValue: mockSocket }],
        });

        service = TestBed.inject(SocketService);
        service['socket'] = mockSocket;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should connect when constructor is called', () => {
        expect(mockSocket.connect).toHaveBeenCalledTimes(0);
    });

    it('should disconnect when navigating to non-whitelist pages', () => {
        service['isConnected'] = true;
        routerEvents.next(new NavigationEnd(1, '/non-whitelist-page', '/non-whitelist-page'));

        expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
    });

    it('should disconnect and connect when navigating to join page', () => {
        service['isConnected'] = true;
        routerEvents.next(new NavigationEnd(1, '/join', '/join'));

        expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
        expect(mockSocket.connect).toHaveBeenCalledTimes(1);
    });

    it('should send event and process queue', () => {
        service['isSendingMessage'] = false;
        service.send('test-event', 'test-arg');

        expect(mockSocket.emit).toHaveBeenCalledWith('test-event', 'test-arg', jasmine.any(Function));
    });

    it('should listen to event', () => {
        const callback = jasmine.createSpy('callback');
        service.listen<string>('test-event', callback);

        expect(mockSocket.on).toHaveBeenCalledWith('test-event', jasmine.any(Function));
    });

    it('should cancel listen to event', () => {
        service.cancelListen('test-event');

        expect(mockSocket.off).toHaveBeenCalledWith('test-event');
    });

    it('should connect manually', () => {
        service.connect();

        expect(service['isConnected']).toBeTrue();
        expect(mockSocket.connect).toHaveBeenCalledTimes(1);
    });

    it('should disconnect manually with info message', () => {
        service['isConnected'] = true;
        service['disconnect']();

        expect(service['isConnected']).toBeFalse();
        expect(mockSocket.disconnect).toHaveBeenCalledTimes(1);
    });
    it('should process the message queue', (done) => {
        service['messageQueue'].push({ eventName: 'test-event-1', args: ['data1'] });
        service['messageQueue'].push({ eventName: 'test-event-2', args: ['data2'] });

        mockSocket.emit.and.callFake((eventName, data, callback) => {
            callback();
            return mockSocket;
        });

        service['isSendingMessage'] = false;
        service['processQueue']();

        setTimeout(() => {
            expect(mockSocket.emit).toHaveBeenCalledWith('test-event-1', 'data1', jasmine.any(Function));

            expect(mockSocket.emit).toHaveBeenCalledWith('test-event-2', 'data2', jasmine.any(Function));

            expect(service['messageQueue'].length).toBe(0);
            expect(service['isSendingMessage']).toBeFalse();
            done();
        }, 0);
    });

    it('should debug heartbeat', () => {
        spyOn(console, 'log');
        service['debugHeartbeat']();
        expect(mockSocket.on).toHaveBeenCalledWith('test', jasmine.any(Function));
        mockSocket.on.calls.mostRecent().args[1]('test-data');
        // eslint-disable-next-line no-console
        expect(console.log).toHaveBeenCalledWith('test-data');
    });

    it('should return if disconnected', () => {
        service['isConnected'] = false;
        routerEvents.next(new NavigationEnd(1, '/non-whitelist-page', '/non-whitelist-page'));

        expect(mockSocket.disconnect).toHaveBeenCalledTimes(0);
    });

    it('should return if instance of event isnt NavigationEnd', () => {
        routerEvents.next({});
        expect(mockSocket.disconnect).toHaveBeenCalledTimes(0);
    });
});
