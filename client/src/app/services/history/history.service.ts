import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '@app/constants';
import { GameRecord } from '@common/types';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HistoryService {
    private history: GameRecord[] = [];

    constructor(private http: HttpClient) {}

    addRecord(record: GameRecord) {
        this.history.push(record);
    }
    getAllRecords(): Observable<GameRecord[]> {
        return this.http.get<GameRecord[]>(BASE_URL);
    }

    getHistory(): GameRecord[] {
        return this.history;
    }

    clearHistory(): Observable<GameRecord[]> {
        return this.http.delete<GameRecord[]>(BASE_URL);
    }
}
