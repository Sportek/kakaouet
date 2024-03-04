import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '@app/constants';
import { QuestionFeedback, Quiz } from '@common/types';
import { Observable, Subject, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class QuizService {
    private baseURL = BASE_URL + '/quiz';
    private quizUpdateSubject = new Subject<void>();
    private quizUpdates: Observable<void> = this.quizUpdateSubject.asObservable();

    private amountOfQuestionsSubject = new Subject<number>();
    private amountOfQuestions: Observable<number> = this.amountOfQuestionsSubject.asObservable();

    constructor(private http: HttpClient) {}

    getAllQuizzes(): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(BASE_URL + '/quiz');
    }

    getQuizById(id: string): Observable<Quiz> {
        const url = `${BASE_URL}/quiz/${id}`;
        return this.http.get<Quiz>(url);
    }

    addNewQuiz(quiz: Quiz): Observable<Quiz> {
        return this.http.post<Quiz>(this.baseURL, quiz).pipe(tap(() => this.updateQuizzes()));
    }

    updateQuizById(id: string, quiz: Quiz): Observable<Quiz> {
        const url = `${BASE_URL}/quiz/${id}`;
        return this.http.patch<Quiz>(url, quiz).pipe(tap(() => this.updateQuizzes()));
    }

    deleteQuizById(id: string): void {
        const url = `${BASE_URL}/quiz/${id}`;
        this.http.delete<void>(url).subscribe({});
    }

    requestCorrectAnswers(quizId: string, index: number): Observable<number[]> {
        const url = `${BASE_URL}/quiz/${quizId}?index=${index}`;
        return this.http.get<number[]>(url);
    }

    correctQuizAnswers(quizId: string, questionId: number, answers: number[]): Observable<QuestionFeedback> {
        const url = `${BASE_URL}/quiz/validate/${quizId}/${questionId}`;
        return this.http.post<QuestionFeedback>(url, { answers });
    }

    updateQuizzes() {
        this.quizUpdateSubject.next();
    }

    getQuizUpdates(): Observable<void> {
        return this.quizUpdates;
    }
    specifyAmountOfQuizzes(length: number) {
        this.amountOfQuestionsSubject.next(length);
    }

    getAmountOfQuizzes(): Observable<number> {
        return this.amountOfQuestions;
    }

    changeVisibility(quiz: Quiz): void {
        quiz.visibility = !quiz.visibility;
        // eslint-disable-next-line no-underscore-dangle
        this.updateQuizById(quiz._id, quiz).subscribe({});
    }

    removeQuiz(quiz: Quiz, quizList: Quiz[]): Observable<Quiz[]> {
        const index: number = quizList.indexOf(quiz);
        // eslint-disable-next-line no-underscore-dangle
        this.deleteQuizById(quizList[index]._id);
        quizList.splice(index, 1);
        return of(quizList);
    }

    generateQuizAsFile(quiz: Quiz) {
        const quizNoVisibilityNoId: Partial<Quiz> = {
            name: quiz.name,
            description: quiz.description,
            duration: quiz.duration,
            questions: quiz.questions,
            createdAt: quiz.createdAt,
            updatedAt: quiz.updatedAt,
        };
        const fileContent = JSON.stringify(quizNoVisibilityNoId);
        const blob = new Blob([fileContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = quiz.name + '.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
