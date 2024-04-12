import { TestBed } from '@angular/core/testing';

import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmationService } from './confirmation.service';

describe('ConfirmationService', () => {
    let service: ConfirmationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
        });
        service = TestBed.inject(ConfirmationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
