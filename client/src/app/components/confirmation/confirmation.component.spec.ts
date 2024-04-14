import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationComponent } from './confirmation.component';

describe('ConfirmationComponent', () => {
    let component: ConfirmationComponent;
    let fixture: ComponentFixture<ConfirmationComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ConfirmationComponent],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {
                        close: jasmine.createSpy('close'),
                    },
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: { message: 'Are you sure?' },
                },
            ],
        });
        fixture = TestBed.createComponent(ConfirmationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close with false', () => {
        component.cancel();
        expect(component.dialogRef.close).toHaveBeenCalledWith(false);
    });

    it('should close with true', () => {
        component.confirm();
        expect(component.dialogRef.close).toHaveBeenCalledWith(true);
    });
});
