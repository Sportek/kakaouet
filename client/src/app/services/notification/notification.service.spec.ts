import { TestBed } from '@angular/core/testing';

import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
    let service: NotificationService;
    let mockSnackbar: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        mockSnackbar = jasmine.createSpyObj('MatSnackBar', ['open']);
        TestBed.configureTestingModule({
            providers: [{ provide: MatSnackBar, useValue: mockSnackbar }],
        });
        service = TestBed.inject(NotificationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should open success snackbar', () => {
        const message = 'Operation successful';
        service.success(message);
        expect(mockSnackbar.open).toHaveBeenCalledWith(message, '✅', {
            duration: 3000,
            panelClass: ['success-snackbar'],
        });
    });

    it('should open error snackbar', () => {
        const message = 'Error occurred';
        service.error(message);
        expect(mockSnackbar.open).toHaveBeenCalledWith(message, '❌', {
            duration: 3000,
            panelClass: ['error-snackbar'],
        });
    });

    it('should open warning snackbar', () => {
        const message = 'Warning issued';
        service.warning(message);
        expect(mockSnackbar.open).toHaveBeenCalledWith(message, '⚠️', {
            duration: 3000,
            panelClass: ['warning-snackbar'],
        });
    });

    it('should open info snackbar', () => {
        const message = 'Information';
        service.info(message);
        expect(mockSnackbar.open).toHaveBeenCalledWith(message, 'ℹ️', {
            duration: 3000,
            panelClass: ['info-snackbar'],
        });
    });

    it('should allow custom duration for snackbar', () => {
        const message = 'Custom duration message';
        const customDuration = 5000;
        service.success(message, customDuration);
        expect(mockSnackbar.open).toHaveBeenCalledWith(message, '✅', {
            duration: customDuration,
            panelClass: ['success-snackbar'],
        });
    });
});
