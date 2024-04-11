import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OrganisatorService } from './organisator.service';

describe('OrganisatorService', () => {
    let service: OrganisatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(OrganisatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
