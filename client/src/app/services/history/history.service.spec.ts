import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationDialogComponent } from '@app/components/dialog-component/dialog-delete.component';
import { BASE_URL } from '@app/constants';
import { GameRecords, Ordering, OrderingField } from '@common/types';
import { of } from 'rxjs';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
    let service: HistoryService;
    let httpMock: HttpTestingController;
    let dialog: MatDialog;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatDialogModule, BrowserAnimationsModule],
            providers: [HistoryService],
        });
        service = TestBed.inject(HistoryService);
        httpMock = TestBed.inject(HttpTestingController);
        dialog = TestBed.inject(MatDialog);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('addRecord should add a record', () => {
        const initialRecords: GameRecords[] = [];
        service['history$'].next(initialRecords);
        const newRecord: GameRecords = { gameTitle: 'Game C', startTime: new Date(), numberOfPlayers: 5, bestScore: 200 };
        service.addRecord(newRecord);
        service.getHistory().subscribe((history) => {
            expect(history).toEqual([...initialRecords, newRecord]);
        });
    });

    it('getAllRecords should return all records', () => {
        const expectedRecords: GameRecords[] = [{ gameTitle: 'Game C', startTime: new Date(), numberOfPlayers: 5, bestScore: 200 }];
        service.getAllRecords().subscribe((records) => {
            expect(records).toEqual(expectedRecords);
        });
        const req = httpMock.expectOne(`${BASE_URL}/history/`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedRecords);
    });

    it('addToHistory should post a new record and return it', () => {
        const newRecord: GameRecords = { gameTitle: 'Game C', startTime: new Date(), numberOfPlayers: 5, bestScore: 200 };
        service.addToHistory(newRecord).subscribe((record) => {
            expect(record).toEqual(newRecord);
        });
        const req = httpMock.expectOne(`${BASE_URL}/history/`);
        expect(req.request.method).toBe('POST');
        req.flush(newRecord);
    });
    it('clearHistory should delete and update history', () => {
        const expectedRecords: GameRecords[] = [];
        service.clearHistory().subscribe((records) => {
            expect(records).toEqual(expectedRecords);
        });
        const req = httpMock.expectOne(`${BASE_URL}/history/`);
        expect(req.request.method).toBe('DELETE');
        req.flush(expectedRecords);
    });

    it('confirmClearHistory should clear history on user confirmation', () => {
        spyOn(dialog, 'open').and.returnValue({ afterClosed: () => of(true) } as MatDialogRef<ConfirmationDialogComponent>);
        spyOn(service, 'clearHistory').and.returnValue(of([]));
        service.confirmClearHistory();
        expect(service.clearHistory).toHaveBeenCalled();
    });

    it('updateSort should set correct sort criteria and call applySorting', () => {
        spyOn(service, 'applySorting');
        service.updateSort('Nom de Jeu Ascendant');
        expect(service.currentSortField).toEqual(OrderingField.GameTitle);
        expect(service.currentSortOrder).toEqual(Ordering.ascending);
        expect(service.applySorting).toHaveBeenCalled();

        service.updateSort('Temps de début de partie Descendant');
        expect(service.currentSortField).toEqual(OrderingField.StartTime);
        expect(service.currentSortOrder).toEqual(Ordering.descending);
        expect(service.applySorting).toHaveBeenCalledTimes(2);
    });

    it('applySorting should sort records correctly', () => {
        const records: GameRecords[] = [
            { gameTitle: 'Game B', startTime: new Date('2021-01-02'), numberOfPlayers: 3, bestScore: 150 },
            { gameTitle: 'Game A', startTime: new Date('2021-01-01'), numberOfPlayers: 4, bestScore: 100 },
        ];
        service['history$'].next(records);

        service.currentSortField = OrderingField.GameTitle;
        service.currentSortOrder = Ordering.ascending;
        service.applySorting();
        expect(records).toBeDefined();

        service.currentSortField = OrderingField.StartTime;
        service.currentSortOrder = Ordering.descending;
        service.applySorting();
        expect(records).toBeDefined();
    });
});
