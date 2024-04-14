import { Component, OnDestroy, OnInit } from '@angular/core';
import { HistoryService } from '@app/services/history/history.service';
import { SelectorService } from '@app/services/selector/selector.service';
import { GameRecords } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit, OnDestroy {
    gameRecords: GameRecords[] = [];
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
                this.historyService.sortRecords();
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
        this.historyService.updateSort(choice);
    }

}
