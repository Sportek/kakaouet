import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

const DEFAULT_DURATION = 3000;
@Injectable({
    providedIn: 'root',
})
export class NotificationService {
    constructor(private snackbar: MatSnackBar) {}

    success(message: string, duration: number = DEFAULT_DURATION): void {
        this.snackbar.open(message, '✅', {
            duration,
            panelClass: ['success-snackbar'],
        });
    }

    error(message: string, duration: number = DEFAULT_DURATION): void {
        this.snackbar.open(message, '❌', {
            duration,
            panelClass: ['error-snackbar'],
        });
    }

    warning(message: string, duration: number = DEFAULT_DURATION): void {
        this.snackbar.open(message, '⚠️', {
            duration,
            panelClass: ['warning-snackbar'],
        });
    }

    info(message: string, duration: number = DEFAULT_DURATION): void {
        this.snackbar.open(message, 'ℹ️', {
            duration,
            panelClass: ['info-snackbar'],
        });
    }
}
