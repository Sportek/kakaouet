import { Component, OnDestroy, OnInit } from '@angular/core';
import { HistoryService } from '@app/services/history/history.service';
import { SelectorService } from '@app/services/selector/selector.service';
import { GameRecords, Ordering, OrderingField } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit, OnDestroy {
    gameRecords: GameRecords[] = [];
    currentSortField: OrderingField = OrderingField.GameTitle;
    currentSortOrder: Ordering = Ordering.ascending;
    recordsSubscription: Subscription[] = [];
    historyCleared: boolean = false;

    constructor(
        private historyService: HistoryService,
        private selectorService: SelectorService,
    ) {}

    ngOnInit(): void {
        this.recordsSubscription.push(
            this.historyService.getAllRecords().subscribe((data: GameRecords[]) => {
                this.gameRecords = data;
                this.sortRecords();
                this.historyCleared = !this.gameRecords.length;
            }),
        );

        this.recordsSubscription.push(
            this.historyService.getHistory().subscribe((gameRecords: GameRecords[]) => {
                this.gameRecords = gameRecords;
                this.historyCleared = !this.gameRecords.length;
            }),
        );

        this.recordsSubscription.push(
            this.selectorService.getCurrentChoice().subscribe((choice) => {
                this.updateSort(choice);
            }),
        );
    }

    ngOnDestroy() {
        this.recordsSubscription.forEach((subscription: Subscription) => subscription.unsubscribe());
    }

    updateSort(choice: string): void {
        if (choice.includes('Temps de début de partie')) {
            this.currentSortField = OrderingField.StartTime;
        } else if (choice.includes('Nom de Jeu')) {
            this.currentSortField = OrderingField.GameTitle;
        }
        if (choice.includes('Ascendant')) {
            this.currentSortOrder = Ordering.ascending;
        } else if (choice.includes('Descendant')) {
            this.currentSortOrder = Ordering.descending;
        }
        this.sortRecords();
    }

    sortRecords(): void {
        this.gameRecords.sort((a, b) => {
            let comparison = 0;
            switch (this.currentSortField) {
                case OrderingField.GameTitle:
                    comparison = a.gameTitle.localeCompare(b.gameTitle);
                    break;
                case OrderingField.StartTime:
                    comparison = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
                    break;
            }
            return this.currentSortOrder === Ordering.ascending ? comparison : -comparison;
        });
    }
}
