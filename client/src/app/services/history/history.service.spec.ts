import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BASE_URL } from '@app/constants';
import { History } from '@common/types';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
    let service: HistoryService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HistoryService],
        });

        service = TestBed.inject(HistoryService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('addRecord should add a record', () => {
        const initialLength = service.getHistory().length;
        service.addRecord({ gameTitle: 'Test Game', startTime: new Date(), numberOfPlayers: 4, bestScore: 100 });
        expect(service.getHistory().length).toBeGreaterThan(initialLength);
    });

    it('getAllRecords should make GET request', () => {
        service.getAllRecords().subscribe((records) => {
            expect(records.length).toBe(2);
        });

        const req = httpMock.expectOne(`${BASE_URL}/history/`);
        expect(req.request.method).toBe('GET');
        req.flush([{ gameTitle: 'Game 1' }, { gameTitle: 'Game 2' }]);
    });

    it('addToHistory should make POST request', () => {
        const newHistory: History = { gameTitle: 'New Game', startTime: new Date(), numberOfPlayers: 4, bestScore: 100 };
        service.addToHistory(newHistory).subscribe((history) => {
            expect(history).toEqual(newHistory);
        });

        const req = httpMock.expectOne(`${BASE_URL}/history/`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ history: newHistory });
        req.flush(newHistory);
    });

    it('clearHistory should make DELETE request', () => {
        service.clearHistory().subscribe((response) => {
            expect(response.length).toBe(0);
        });

        const req = httpMock.expectOne(`${BASE_URL}/history/`);
        expect(req.request.method).toBe('DELETE');
        req.flush([]);
    });
});
