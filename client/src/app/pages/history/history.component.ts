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
    currentSortField: string = 'gameTitle';
    currentSortOrder: string = 'asc';
    recordsSubscription: Subscription;
    historyCleared: boolean = false;

    constructor(
        private historyService: HistoryService,
        public dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.recordsSubscription = this.historyService.getAllRecords().subscribe((data: History[]) => {
            this.gameRecords = data;
            this.sortRecords();
            this.historyCleared = this.gameRecords.length === 0;
        });
    }

    sortRecords(): void {
        if (this.currentSortField === 'gameTitle') {
            this.sortByTitle();
        } else if (this.currentSortField === 'startTime') {
            this.sortByStartDate();
        }
    }

    sortByTitle(): void {
        this.gameRecords = this.gameRecords.sort((a, b) => {
            return this.currentSortOrder === 'asc' ? a.gameTitle.localeCompare(b.gameTitle) : b.gameTitle.localeCompare(a.gameTitle);
        });
    }

    sortByStartDate(): void {
        this.gameRecords = this.gameRecords.sort((a, b) => {
            const dateA = new Date(a.startTime).getTime();
            const dateB = new Date(b.startTime).getTime();
            return this.currentSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }

    handleSort(field: string): void {
        this.currentSortField = field === 'Temps de début de partie' ? 'startTime' : 'gameTitle';
        this.sortRecords();
    }

    handleOrderChange(order: string): void {
        this.currentSortOrder = order === 'Ascendant' ? 'asc' : 'desc';
        this.sortRecords();
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
                    this.historyCleared = true;
                });
            }
        });
    }
}
