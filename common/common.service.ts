/*import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
//import { Quiz } from './quiz';

@Injectable({
    providedIn: 'root',
})
export class QuizService {
    private baseURL = 'http://localhost:3000/api/quiz';

    constructor(private http: HttpClient) {}

    getAllQuizzes(): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(this.baseURL);
    }

    getQuizById(id: string): Observable<Quiz> {
        const url = `${this.baseURL}/${id}`;
        return this.http.get<Quiz>(url);
    }

    // getQuestionsById(id: string): Observable<>
}*/