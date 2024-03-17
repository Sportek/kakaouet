import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { SocketService } from '@app/services/socket/socket.service';
import { socketConnectionGuard } from './socket-connection.guard';

describe('socketConnectionGuard', () => {
    let router: jasmine.SpyObj<Router>;
    let socketService: jasmine.SpyObj<SocketService>;
    let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
    let mockRouterStateSnapshot: jasmine.SpyObj<RouterStateSnapshot>;

    const executeGuard: CanActivateFn = async (...guardParameters) =>
        TestBed.runInInjectionContext(async () => {
            return socketConnectionGuard(...guardParameters) as boolean;
        });

    beforeEach(() => {
        router = jasmine.createSpyObj('Router', ['navigate']);
        socketService = jasmine.createSpyObj('SocketService', [], { isConnected: false });
        mockActivatedRouteSnapshot = new ActivatedRouteSnapshot();
        mockRouterStateSnapshot = jasmine.createSpyObj('RouterStateSnapshot', [], { url: '/dummy-url' });

        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: router },
                { provide: SocketService, useValue: socketService },
            ],
        });
    });

    it('should be created', () => {
        expect(executeGuard).toBeTruthy();
    });

    it('should navigate to home if socket is not connected', async () => {
        socketService.isConnected = false;

        const result = await TestBed.runInInjectionContext(async () => socketConnectionGuard(mockActivatedRouteSnapshot, mockRouterStateSnapshot));

        expect(result).toBeFalse();
        expect(router.navigate).toHaveBeenCalledWith(['/']);
    });
});
