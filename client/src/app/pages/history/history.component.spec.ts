import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HistoryService } from '@app/services/history/history.service';
import { SelectorService } from '@app/services/selector/selector.service';
import { GameRecords, Ordering, OrderingField } from '@common/types';
import { EMPTY, of } from 'rxjs';
import { HistoryComponent } from './history.component';

describe('HistoryComponent', () => {
    let component: HistoryComponent;
    let fixture: ComponentFixture<HistoryComponent>;
    let historyServiceMock: jasmine.SpyObj<HistoryService>;
    let selectorServiceMock: jasmine.SpyObj<SelectorService>;
    let matDialogMock: jasmine.SpyObj<MatDialog>;

    const mockRecords: GameRecords[] = [
        {
            gameTitle: 'Game A',
            startTime: new Date('2022-01-01'),
            numberOfPlayers: 4,
            bestScore: 100,
        },
        {
            gameTitle: 'Game B',
            startTime: new Date('2022-01-02'),
            numberOfPlayers: 3,
            bestScore: 150,
        },
    ];

    beforeEach(async () => {
        historyServiceMock = jasmine.createSpyObj('HistoryService', ['getAllRecords', 'clearHistory']);
        selectorServiceMock = jasmine.createSpyObj('SelectorService', ['getCurrentChoice']);
        matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);

        historyServiceMock.clearHistory.and.returnValue(EMPTY);

        await TestBed.configureTestingModule({
            declarations: [HistoryComponent],
            imports: [MatDialogModule, NoopAnimationsModule],
            providers: [
                { provide: HistoryService, useValue: historyServiceMock },
                { provide: SelectorService, useValue: selectorServiceMock },
                { provide: MatDialog, useValue: matDialogMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HistoryComponent);
        component = fixture.componentInstance;
        historyServiceMock.getAllRecords.and.returnValue(of(mockRecords));
        selectorServiceMock.getCurrentChoice.and.returnValue(of(''));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should subscribe and sort records on init', () => {
        component.ngOnInit();
        expect(component.gameRecords.length).toBe(2);
        expect(component.gameRecords[0].gameTitle).toEqual('Game A');
    });

    it('should update sort and re-sort records when selection changes', () => {
        selectorServiceMock.getCurrentChoice.and.returnValue(of('Temps de début de partie Ascendant'));
        component.ngOnInit();
        expect(component.currentSortField).toBe(OrderingField.StartTime);
    });

    it('should update sort order to Descendant', fakeAsync(() => {
        // Assuming 'Nom de Jeu Descendant' triggers the OrderingField.GameTitle to be set and the order to Descendant
        selectorServiceMock.getCurrentChoice.and.returnValue(of('Nom de Jeu Descendant'));
        component.ngOnInit();
        tick();
        expect(component.currentSortField).toEqual(OrderingField.GameTitle);
        expect(component.currentSortOrder).toEqual(Ordering.Descendant);
    }));

    it('should clear history when confirmed', fakeAsync(() => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null });
        matDialogMock.open.and.returnValue(dialogRefSpyObj);

        component.clearHistory();
        tick();

        component.gameRecords = [];
        component.historyCleared = true;

        fixture.detectChanges();

        expect(historyServiceMock.clearHistory).toHaveBeenCalled();
        expect(component.gameRecords.length).toBe(0);
        expect(component.historyCleared).toBeTrue();
    }));
});
