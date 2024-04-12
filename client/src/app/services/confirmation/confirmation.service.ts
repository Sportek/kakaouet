import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationComponent } from '@app/components/confirmation/confirmation.component';

@Injectable({
    providedIn: 'root',
})
export class ConfirmationService {
    constructor(public dialog: MatDialog) {}

    confirm(message: string, callback: () => void) {
        const dialogRef = this.dialog.open(ConfirmationComponent, {
            width: '450px',
            data: { message },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                callback();
            }
        });
    }
}
