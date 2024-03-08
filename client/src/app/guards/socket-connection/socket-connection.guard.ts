import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SocketService } from '@app/services/socket/socket.service';

export const socketConnectionGuard: CanActivateFn = () => {
    const isConnected = inject(SocketService).isConnected;
    if (!isConnected) {
        inject(Router).navigate(['/']);
    }
    return isConnected;
};
