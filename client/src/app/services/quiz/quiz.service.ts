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

    deleteQuizById(id: string): Observable<void> {
        const url = `${BASE_URL}/quiz/${id}`;
        return this.http.delete<void>(url);
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
                quiz.updatedAt = quizToGet.updatedAt;
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
        updatedQuiz.updatedAt = new Date();
        updatedQuiz.visibility = quiz.visibility;
        const validatedQuiz = this.validateService.validateQuiz(updatedQuiz).object;
        this.updateQuizById(validatedQuiz._id, validatedQuiz).subscribe({});
    }

    isError(quiz: Quiz): string | null {
        if (!QuizValidation.checkRequiredName.callback({ name: quiz.name })) {
            return QuizValidation.checkRequiredName.errorMessage;
        }

        if (!QuizValidation.checkMaxTitleLength.callback({ name: quiz.name })) {
            return QuizValidation.checkMaxTitleLength.errorMessage;
        }

        if (!QuizValidation.checkMaxWordLength.callback({ name: quiz.name })) {
            return QuizValidation.checkMaxWordLength.errorMessage;
        }

        if (!QuizValidation.checkMinResponseTime.callback({ duration: quiz.duration })) {
            return QuizValidation.checkMinResponseTime.errorMessage;
        }

        if (!QuizValidation.checkMaxResponseTime.callback({ duration: quiz.duration })) {
            return QuizValidation.checkMaxResponseTime.errorMessage;
        }

        if (!QuizValidation.checkMinDescriptionLength.callback({ description: quiz.description })) {
            return QuizValidation.checkMinDescriptionLength.errorMessage;
        }

        if (!QuizValidation.checkMaxDescriptionLength.callback({ description: quiz.description })) {
            return QuizValidation.checkMaxDescriptionLength.errorMessage;
        }

        if (!QuizValidation.checkRequiredQuestions.callback({ questions: quiz.questions })) {
            return QuizValidation.checkRequiredQuestions.errorMessage;
        }
        return null;
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
