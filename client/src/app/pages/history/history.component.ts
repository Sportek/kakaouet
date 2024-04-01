import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/dialog-component/dialog-delete.component';
import { HistoryService } from '@app/services/history/history.service';
import { History } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
    gameRecords: History[] = [];
    sortAscending = true;
    recordsSubscription: Subscription;
    historyCleared: boolean = false;

    constructor(
        private historyService: HistoryService,
        public dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.recordsSubscription = this.historyService.getAllRecords().subscribe((data: History[]) => {
            this.gameRecords = data;
            if (this.gameRecords.length === 0) {
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
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '350px',
            data: {
                title: 'Confirmation de la suppression',
                message: 'Êtes-vous sûr de vouloir supprimer votre historique?',
            },
        });

        dialogRef.afterClosed().subscribe((confirm) => {
            if (confirm) {
                this.historyService.clearHistory().subscribe((data: History[]) => {
                    this.gameRecords = data;
                });
                this.historyCleared = true;
            }
        });
    }
}
