import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { HistoryService } from '@app/services/history/history.service';
import { SelectorService } from '@app/services/selector/selector.service';
import { Ordering, OrderingField } from '@common/types';
import { of } from 'rxjs';
import { HistoryComponent } from './history.component';

describe('HistoryComponent', () => {
    let component: HistoryComponent;
    let fixture: ComponentFixture<HistoryComponent>;
    let historyServiceMock: jasmine.SpyObj<HistoryService>;
    let selectorServiceMock: jasmine.SpyObj<SelectorService>;

    beforeEach(async () => {
        historyServiceMock = jasmine.createSpyObj('HistoryService', ['getAllRecords', 'getHistory']);
        selectorServiceMock = jasmine.createSpyObj('SelectorService', ['getCurrentChoice']);

        historyServiceMock.getAllRecords.and.returnValue(of([]));
        historyServiceMock.getHistory.and.returnValue(of([]));
        selectorServiceMock.getCurrentChoice.and.returnValue(of('Nom de Jeu Descendant'));

        await TestBed.configureTestingModule({
            declarations: [HistoryComponent],
            imports: [MatDialogModule],
            providers: [
                { provide: HistoryService, useValue: historyServiceMock },
                { provide: SelectorService, useValue: selectorServiceMock },
            ],
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

    it('should handle empty records and mark history as cleared', () => {
        component.ngOnInit();
        expect(component.gameRecords.length).toBe(0);
        expect(component.historyCleared).toBeTrue();
    });

    it('should handle non-empty records', () => {
        historyServiceMock.getHistory.and.returnValue(of([{ gameTitle: 'Game C', startTime: new Date(), numberOfPlayers: 5, bestScore: 200 }]));
        component.ngOnInit();
        expect(component.gameRecords.length).toBe(1);
        expect(component.historyCleared).toBeFalse();
    });

    it('should update sort field and order', () => {
        selectorServiceMock.getCurrentChoice.and.returnValue(of('Temps de début de partie Ascendant'));
        component.ngOnInit();
        expect(component.currentSortField).toEqual(OrderingField.StartTime);
        expect(component.currentSortOrder).toEqual(Ordering.ascending);
    });

    it('should sort records by game title in ascending order', () => {
        const mockGameRecords = [
            { gameTitle: 'Zelda', startTime: new Date('2021-01-01'), numberOfPlayers: 2, bestScore: 50 },
            { gameTitle: 'Mario', startTime: new Date('2020-01-01'), numberOfPlayers: 3, bestScore: 75 },
        ];
        historyServiceMock.getHistory.and.returnValue(of(mockGameRecords));
        selectorServiceMock.getCurrentChoice.and.returnValue(of('Nom de Jeu Ascendant'));
        component.ngOnInit();
        expect(component.gameRecords[0].gameTitle).toEqual('Mario');
        expect(component.currentSortOrder).toEqual(Ordering.ascending);
    });

    it('should sort records by game title in descending order', () => {
        const mockGameRecords = [
            { gameTitle: 'Zelda', startTime: new Date('2021-01-01'), numberOfPlayers: 2, bestScore: 50 },
            { gameTitle: 'Mario', startTime: new Date('2020-01-01'), numberOfPlayers: 3, bestScore: 75 },
        ];
        historyServiceMock.getHistory.and.returnValue(of(mockGameRecords));
        selectorServiceMock.getCurrentChoice.and.returnValue(of('Nom de Jeu Descendant'));
        component.ngOnInit();
        expect(component.gameRecords[0].gameTitle).toEqual('Zelda');
        expect(component.currentSortOrder).toEqual(Ordering.descending);
    });

    it('should sort records by start time in descending order', () => {
        const mockStartTimeRecords = [
            { gameTitle: 'Game D', startTime: new Date('2021-01-01'), numberOfPlayers: 2, bestScore: 50 },
            { gameTitle: 'Game E', startTime: new Date('2020-01-01'), numberOfPlayers: 3, bestScore: 75 },
        ];
        historyServiceMock.getHistory.and.returnValue(of(mockStartTimeRecords));
        selectorServiceMock.getCurrentChoice.and.returnValue(of('Temps de début de partie Descendant'));
        component.ngOnInit();
        expect(component.gameRecords[0].gameTitle).toEqual('Game D');
        expect(component.currentSortOrder).toEqual(Ordering.descending);
    });

    it('should sort records by game title in descending order', () => {
        selectorServiceMock.getCurrentChoice.and.returnValue(of('Nom de Jeu Descendant'));
        component.ngOnInit();
        expect(component.currentSortField).toEqual(OrderingField.GameTitle);
        expect(component.currentSortOrder).toEqual(Ordering.descending);
    });

    it('should unsubscribe on destroy', () => {
        const spyUnsubscribe = spyOn(component.recordsSubscription[0], 'unsubscribe');
        component.ngOnDestroy();
        expect(spyUnsubscribe).toHaveBeenCalled();
    });
});
