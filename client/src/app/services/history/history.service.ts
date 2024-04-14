import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/dialog-component/dialog-delete.component';
import { BASE_URL } from '@app/constants';
import { GameRecords, Ordering, OrderingField } from '@common/types';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    private history$: BehaviorSubject<GameRecords[]> = new BehaviorSubject<GameRecords[]>([]);
    private history: Observable<GameRecords[]> = this.history$.asObservable();
    currentSortField: OrderingField = OrderingField.GameTitle;
    currentSortOrder: Ordering = Ordering.ascending;
    constructor(
        private http: HttpClient,
        public dialog: MatDialog,
    ) {}

    addRecord(record: GameRecords) {
        this.history$.next([...this.history$.getValue(), record]);
    }

    getAllRecords(): Observable<GameRecords[]> {
        const url = `${BASE_URL}/history/`;
        return this.http.get<GameRecords[]>(url);
    }

    getHistory(): Observable<GameRecords[]> {
        return this.history;
    }

    addToHistory(history: GameRecords): Observable<GameRecords> {
        const url = `${BASE_URL}/history/`;
        return this.http.post<GameRecords>(url, { history });
    }

    confirmClearHistory(): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '350px',
            data: {
                title: 'Confirmation de la suppression',
                message: 'Êtes-vous sûr de vouloir supprimer votre historique?',
            },
        });

        dialogRef.afterClosed().subscribe((confirm) => {
            if (confirm) {
                this.clearHistory().subscribe(() => {
                    this.history$.next([]);
                });
            }
        });
    }

    clearHistory(): Observable<GameRecords[]> {
        const url = `${BASE_URL}/history/`;
        this.http.delete<GameRecords[]>(url).subscribe((records: GameRecords[]) => {
            this.history$.next(records);
        });
        return this.getHistory();
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
        let currentRecords = this.history$.getValue();
        currentRecords.sort((a, b) => {
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
        this.history$.next(currentRecords);
    }
}
