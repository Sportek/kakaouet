import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Question } from '@common/types';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    private baseURL = 'http://localhost:3000/api/quiz';

    constructor(private http: HttpClient) {}

    getQuestions(): Observable<Question[]> {
        return this.http.get<Question[]>(this.baseURL);
    }
    getQuestionsById(id: string): Observable<Question> {
        const url = `${this.baseURL}/${id}`;
        return this.http.get<Question>(url);
    }

    createQuestion(question: Question): Observable<Question> {
        return this.http.post<Question>(this.baseURL, question);
    }
}
