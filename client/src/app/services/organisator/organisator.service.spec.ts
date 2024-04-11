import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganisatorService } from './organisator.service';

describe('OrganisatorService', () => {
    let service: OrganisatorService;
    let mockSnackbar: jasmine.SpyObj<MatSnackBar>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: MatSnackBar, useValue: mockSnackbar }],
        });
        service = TestBed.inject(OrganisatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
