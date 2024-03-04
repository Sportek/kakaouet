import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '@app/constants';
import { Question, Quiz } from '@common/types';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    private idSubject = new Subject<string>();
    private id$: Observable<string> = this.idSubject.asObservable();

    private questionUpdateSubject = new Subject<void>();
    private questionUpdates: Observable<void> = this.questionUpdateSubject.asObservable();

    private baseURL = BASE_URL + '/question';

    constructor(private http: HttpClient) {}

    getQuestions(): Observable<Question[]> {
        return this.http.get<Question[]>(this.baseURL);
    }

    getQuestionsById(id: string): Observable<Question> {
        const url = `${this.baseURL}/${id}`;
        return this.http.get<Question>(url);
    }

    createQuestion(question: Question): Observable<Question> {
        return this.http.post<Question>(this.baseURL, question).pipe(tap(() => this.updateQuestions()));
    }

    updateQuestion(id: string, question: Question): Observable<Question> {
        const url = `${this.baseURL}/${id}`;
        return this.http.patch<Question>(url, question).pipe(tap(() => this.updateQuestions()));
    }

    updateQuestions() {
        this.questionUpdateSubject.next();
    }

    getQuestionUpdates(): Observable<void> {
        return this.questionUpdates;
    }

    sendId(id: string): void {
        this.idSubject.next(id);
    }

    getId(): Observable<string> {
        return this.id$;
    }

    deleteQuestionById(id: string): Observable<void> {
        const url = `${this.baseURL}/${id}`;
        return this.http.delete<void>(url);
    }

    removeQuestion(question: Question, quiz: Quiz) {
        const index: number = quiz.questions.indexOf(question);
        if (index >= 0) quiz.questions.splice(index, 1);
    }

    moveUp(index: number, quiz: Quiz): void {
        if (index > 0) {
            const temp = quiz.questions[index];
            quiz.questions[index] = quiz.questions[index - 1];
            quiz.questions[index - 1] = temp;
            quiz.questions = [...quiz.questions];
        }
    }

    moveDown(index: number, quiz: Quiz): void {
        if (index < quiz.questions.length - 1) {
            const temp = quiz.questions[index];
            quiz.questions[index] = quiz.questions[index + 1];
            quiz.questions[index + 1] = temp;
            quiz.questions = [...quiz.questions];
        }
    }
}
