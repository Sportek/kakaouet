/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '@app/constants';
import { QuestionFeedback, Quiz } from '@common/types';
import { Observable, Subject, of } from 'rxjs';
import { tap } from 'rxjs/operators';
// eslint-disable-next-line no-restricted-imports
import { QuizValidation, ValidateService } from '../validate/validate.service';

@Injectable({
    providedIn: 'root',
})
export class QuizService {
    private baseURL = BASE_URL + '/quiz';
    private quizUpdateSubject = new Subject<void>();
    private quizUpdates: Observable<void> = this.quizUpdateSubject.asObservable();

    private amountOfQuestionsSubject = new Subject<number>();
    private amountOfQuestions: Observable<number> = this.amountOfQuestionsSubject.asObservable();

    constructor(
        private http: HttpClient,
        private validateService: ValidateService,
    ) {}

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

    createQuiz(quiz: Quiz): void {
        const newQuiz: Partial<Quiz> = {
            name: quiz.name,
            description: quiz.description,
            duration: quiz.duration,
            visibility: false,
            questions: quiz.questions,
        };
        this.addNewQuiz(newQuiz as Quiz).subscribe({});
    }

    getQuiz(id: string, quiz: Quiz): void {
        this.getQuizById(id).subscribe({
            next: (quizToGet) => {
                quiz.name = quizToGet.name;
                quiz.duration = quizToGet.duration;
                quiz.description = quizToGet.description;
                quiz._id = quizToGet._id;
                quiz.questions = quizToGet.questions;
                quiz.visibility = quizToGet.visibility;
                quiz.lastModified = quizToGet.lastModified;
                quiz.createdAt = quizToGet.createdAt;
                quiz = quizToGet;
                this.specifyAmountOfQuizzes(quiz.questions.length);
            },
        });
    }

    updateQuiz(updatedQuiz: Quiz, quiz: Quiz): void {
        updatedQuiz.name = quiz.name;
        updatedQuiz.description = quiz.description;
        updatedQuiz.duration = quiz.duration;
        updatedQuiz.visibility = false;
        updatedQuiz.questions = quiz.questions;
        updatedQuiz.lastModified = new Date();
        updatedQuiz.visibility = quiz.visibility;
        const validatedQuiz = this.validateService.validateQuiz(updatedQuiz).object;
        this.updateQuizById(validatedQuiz._id, validatedQuiz).subscribe({});
    }

    hasError(quiz: Quiz): string | null {
        const validations = [
            { validate: QuizValidation.checkRequiredName, value: { name: quiz.name } },
            { validate: QuizValidation.checkMaxTitleLength, value: { name: quiz.name } },
            { validate: QuizValidation.checkMaxWordLength, value: { name: quiz.name } },
            { validate: QuizValidation.checkMinResponseTime, value: { duration: quiz.duration } },
            { validate: QuizValidation.checkMaxResponseTime, value: { duration: quiz.duration } },
            { validate: QuizValidation.checkMinDescriptionLength, value: { description: quiz.description } },
            { validate: QuizValidation.checkMaxDescriptionLength, value: { description: quiz.description } },
            { validate: QuizValidation.checkRequiredQuestions, value: { questions: quiz.questions } },
        ];

        for (const validation of validations) {
            const { validate, value } = validation;
            if (!validate.callback(value)) {
                return validate.errorMessage;
            }
        }

        return null;
    }

    changeVisibility(quiz: Quiz): void {
        quiz.visibility = !quiz.visibility;
        this.updateQuizById(quiz._id, quiz).subscribe({});
    }

    removeQuiz(quiz: Quiz, quizList: Quiz[]): Observable<Quiz[]> {
        const index: number = quizList.indexOf(quiz);
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
            lastModified: quiz.lastModified,
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
