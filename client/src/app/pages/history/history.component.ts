/* eslint-disable no-case-declarations */
// Pour éviter les erreurs de portée dans les blocs switch.

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/dialog-component/dialog-delete.component';
import { HistoryService } from '@app/services/history/history.service';
import { SelectorService } from '@app/services/selector/selector.service';
import { History, Ordering, OrderingField } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnInit {
    gameRecords: History[] = [];
    currentSortField: OrderingField = OrderingField.GameTitle;
    currentSortOrder: Ordering = Ordering.Ascendant;
    recordsSubscription: Subscription;
    historyCleared: boolean = false;

    constructor(
        private historyService: HistoryService,
        public dialog: MatDialog,
        private selectorService: SelectorService,
    ) {}

    ngOnInit(): void {
        this.recordsSubscription = this.historyService.getAllRecords().subscribe((data: History[]) => {
            this.gameRecords = data;
            this.sortRecords();
            this.historyCleared = this.gameRecords.length === 0;
        });

        this.selectorService.getCurrentChoice().subscribe((choice) => {
            this.updateSort(choice);
        });
    }

    updateSort(choice: string): void {
        if (choice.includes('Temps de début de partie')) {
            this.currentSortField = OrderingField.StartTime;
        } else if (choice.includes('Nom de Jeu')) {
            this.currentSortField = OrderingField.GameTitle;
        }
        if (choice.includes('Ascendant')) {
            this.currentSortOrder = Ordering.Ascendant;
        } else if (choice.includes('Descendant')) {
            this.currentSortOrder = Ordering.Descendant;
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
                    const dateA = new Date(a.startTime).getTime();
                    const dateB = new Date(b.startTime).getTime();
                    comparison = dateA - dateB;
                    break;
            }
            return this.currentSortOrder === Ordering.Ascendant ? comparison : -comparison;
        });
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
                this.historyService.clearHistory().subscribe(() => {
                    this.gameRecords = [];
                    this.historyCleared = true;
                });
            }
        });
    }
}
