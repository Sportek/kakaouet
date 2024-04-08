import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '@app/constants';
import { GameRecords } from '@common/types';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    private history: GameRecords[] = [];

    constructor(private http: HttpClient) {}

    addRecord(record: GameRecords) {
        this.history.push(record);
    }

    getAllRecords(): Observable<GameRecords[]> {
        const url = `${BASE_URL}/history/`;
        return this.http.get<GameRecords[]>(url);
    }

    getHistory(): GameRecords[] {
        return this.history;
    }

    addToHistory(history: GameRecords): Observable<GameRecords> {
        const url = `${BASE_URL}/history/`;
        return this.http.post<GameRecords>(url, { history });
    }

    clearHistory(): Observable<GameRecords[]> {
        const url = `${BASE_URL}/history/`;
        return this.http.delete<GameRecords[]>(url);
    }
}
