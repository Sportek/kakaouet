import { TestBed } from '@angular/core/testing';

import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketEventHandlerService } from './socket-event-handler.service';

describe('SocketEventHandlerService', () => {
    let service: SocketEventHandlerService;
    let mockSnackbar: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: MatSnackBar, useValue: mockSnackbar }],
        });
        service = TestBed.inject(SocketEventHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
