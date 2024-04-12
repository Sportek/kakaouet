import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationDialogComponent } from '@app/components/dialog-component/dialog-delete.component';
import { BASE_URL } from '@app/constants';
import { GameRecords } from '@common/types';
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
        const dialogRefStub: Partial<MatDialogRef<typeof ConfirmationDialogComponent, unknown>> = {
            afterClosed: () => of(true),
        };
        spyOn(dialog, 'open').and.returnValue(dialogRefStub as MatDialogRef<typeof ConfirmationDialogComponent, unknown>);
        spyOn(service, 'clearHistory').and.returnValue(of([]));

        service.confirmClearHistory();

        expect(dialog.open).toHaveBeenCalledWith(ConfirmationDialogComponent, {
            width: '350px',
            data: {
                title: 'Confirmation de la suppression',
                message: 'Êtes-vous sûr de vouloir supprimer votre historique?',
            },
        });
        expect(service.clearHistory).toHaveBeenCalled();
    });
});
