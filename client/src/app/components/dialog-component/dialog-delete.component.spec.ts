import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './dialog-delete.component';

describe('ConfirmationDialogComponent', () => {
    let component: ConfirmationDialogComponent;
    let fixture: ComponentFixture<ConfirmationDialogComponent>;
    const mockDialogRef = { close: jasmine.createSpy('close') };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConfirmationDialogComponent],
            imports: [MatDialogModule],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close the dialog with true on confirm', () => {
        component.onConfirm();
        expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should close the dialog with false on dismiss', () => {
        component.onDismiss();
        expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });

    it('should display the passed title and message', () => {
        component.data = { title: 'Confirm Action', message: 'Are you sure you want to proceed?' };
        fixture.detectChanges();

        const titleElement = fixture.debugElement.nativeElement.querySelector('.confirm-dialog-title');
        const messageElement = fixture.debugElement.nativeElement.querySelector('.confirm-dialog-content');

        expect(titleElement.textContent).toContain('Confirm Action');
        expect(messageElement.textContent).toContain('Are you sure you want to proceed?');
    });
});
