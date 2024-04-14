import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationComponent } from '@app/components/confirmation/confirmation.component';
import { of } from 'rxjs';
import { ConfirmationService } from './confirmation.service';

describe('ConfirmationService', () => {
    let service: ConfirmationService;
    let dialog: MatDialog;
    const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ConfirmationService,
                {
                    provide: MatDialog,
                    useValue: {
                        open: jasmine.createSpy('open').and.returnValue(dialogRefSpyObj),
                    },
                },
            ],
        });
        service = TestBed.inject(ConfirmationService);
        dialog = TestBed.inject(MatDialog);
    });

    it('should open a dialog with the correct parameters', () => {
        service.confirm('Confirm this action?', () => {
            return true;
        });
        expect(dialog.open).toHaveBeenCalledWith(ConfirmationComponent, {
            width: '450px',
            data: { message: 'Confirm this action?' },
        });
    });

    it('should execute callback if confirmed', () => {
        const callback = jasmine.createSpy('callback');
        service.confirm('Confirm this action?', callback);
        expect(callback).toHaveBeenCalled();
    });
});
