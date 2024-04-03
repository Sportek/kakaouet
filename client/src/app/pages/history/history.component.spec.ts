/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/dialog-component/dialog-delete.component';
import { HistoryService } from '@app/services/history/history.service';
import { SelectorService } from '@app/services/selector/selector.service';
import { of } from 'rxjs';
import { HistoryComponent } from './history.component';

class MockHistoryService {
    getAllRecords() {
        return of([
            { gameTitle: 'Game A', startTime: '2021-01-01', numberOfPlayers: 10, bestScore: 100 },
            { gameTitle: 'Game B', startTime: '2021-01-02', numberOfPlayers: 8, bestScore: 80 },
        ]);
    }
    clearHistory() {
        return of([]);
    }
}

class MockSelectorService {
    getCurrentChoice() {
        return of('GameTitle');
    }
}

describe('HistoryComponent', () => {
    let component: HistoryComponent;
    let fixture: ComponentFixture<HistoryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HistoryComponent, ConfirmationDialogComponent],
            providers: [
                { provide: HistoryService, useClass: MockHistoryService },
                { provide: SelectorService, useClass: MockSelectorService },
                { provide: MatDialog, useValue: {} },
            ],
            imports: [MatDialogModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
