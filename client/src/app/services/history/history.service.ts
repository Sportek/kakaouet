import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/dialog-component/dialog-delete.component';
import { BASE_URL } from '@app/constants';
import { GameRecords } from '@common/types';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    private history$: BehaviorSubject<GameRecords[]> = new BehaviorSubject<GameRecords[]>([]);
    private history: Observable<GameRecords[]> = this.history$.asObservable();

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
}
