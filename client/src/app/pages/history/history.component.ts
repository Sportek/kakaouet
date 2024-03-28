import { Component, OnInit } from '@angular/core';
import { HistoryService } from '@app/services/history/history.service';
import { GameRecord } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
    gameRecords: GameRecord[] = [];
    sortAscending = true;
    recordsSubscription: Subscription;
    historyCleared: boolean = false;

    constructor(private historyService: HistoryService) {}

    ngOnInit(): void {
        this.recordsSubscription = this.historyService.getAllRecords().subscribe((data: GameRecord[]) => {
            this.gameRecords = data;
            // eslint-disable-next-line eqeqeq
            if (this.gameRecords.length == 0) {
                this.historyCleared = true;
            }
        });
    }

    sortByTitle(): void {
        this.gameRecords.sort((a, b) => {
            return this.sortAscending ? a.gameTitle.localeCompare(b.gameTitle) : b.gameTitle.localeCompare(a.gameTitle);
        });
        this.sortAscending = !this.sortAscending;
    }

    sortByStartDate(): void {
        this.gameRecords.sort((a, b) => {
            return this.sortAscending
                ? new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                : new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        });
        this.sortAscending = !this.sortAscending;
    }

    clearHistory(): void {
        this.historyService.clearHistory().subscribe(() => {
            this.gameRecords = [];
        });
        this.historyCleared = true;
        this.gameRecords = [];
    }
}
