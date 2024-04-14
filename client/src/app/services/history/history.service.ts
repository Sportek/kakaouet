import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BASE_URL } from '@app/constants';
import { ConfirmationService } from '@app/services/confirmation/confirmation.service';
import { GameRecords, Ordering, OrderingField } from '@common/types';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    currentSortField: OrderingField = OrderingField.GameTitle;
    currentSortOrder: Ordering = Ordering.ascending;
    private history$: BehaviorSubject<GameRecords[]> = new BehaviorSubject<GameRecords[]>([]);
    private history: Observable<GameRecords[]> = this.history$.asObservable();

    constructor(
        private http: HttpClient,
        public dialog: MatDialog,
        private confirmation: ConfirmationService,
    ) {}

    addRecord(record: GameRecords) {
        this.history$.next([...this.history$.getValue(), record]);
    }

    getAllRecords(): Observable<GameRecords[]> {
        const url = `${BASE_URL}/history/`;
        return this.http.get<GameRecords[]>(url).pipe(
            tap((records) => {
                this.history$.next(records); // Update the BehaviorSubject with new records
                this.applySorting(); // Apply sorting to the new records
            }),
        );
    }

    getHistory(): Observable<GameRecords[]> {
        return this.history;
    }

    addToHistory(history: GameRecords): Observable<GameRecords> {
        const url = `${BASE_URL}/history/`;
        return this.http.post<GameRecords>(url, { history });
    }

    confirmClearHistory(): void {
        this.confirmation.confirm("Êtes-vous sûr de vouloir supprimer l'historique?", () => {
            this.clearHistory().subscribe(() => {
                this.history$.next([]);
            });
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
        this.applySorting();
    }

    applySorting(): void {
        const sortedRecords = this.history$.getValue().sort((a, b) => {
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
        this.history$.next(sortedRecords);
    }
}
