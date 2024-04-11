import { TestBed } from '@angular/core/testing';

import { OrganisatorService } from './organisator.service';

describe('OrganisatorService', () => {
    let service: OrganisatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(OrganisatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
