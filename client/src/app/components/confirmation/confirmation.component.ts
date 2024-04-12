import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-confirmation',
    templateUrl: './confirmation.component.html',
    styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent {
    constructor(
        public dialogRef: MatDialogRef<ConfirmationComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { message: string },
    ) {}

    cancel() {
        this.dialogRef.close(false);
    }

    confirm() {
        this.dialogRef.close(true);
    }
}
