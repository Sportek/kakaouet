import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '@app/constants';
import { History } from '@common/types';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    private history: History[] = [];

    constructor(private http: HttpClient) {}

    addRecord(record: History) {
        this.history.push(record);
    }
    getAllRecords(): Observable<History[]> {
        return this.http.get<History[]>(BASE_URL);
    }

    getHistory(): History[] {
        return this.history;
    }

    addToHistory(history: History): Observable<History> {
        const url = `${BASE_URL}/history/`;
        return this.http.post<History>(url, { history });
    }
    clearHistory(): Observable<History[]> {
        return this.http.delete<History[]>(BASE_URL);
    }
}
