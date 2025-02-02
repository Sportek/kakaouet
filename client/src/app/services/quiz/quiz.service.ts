import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '@app/constants';
import { NotificationService } from '@app/services/notification/notification.service';
import { ValidateService } from '@app/services/validate/validate.service';
import { NUMBRE_OF_QCM_QUESTION, RANDOM_ID } from '@common/constants';
import { QuestionFeedback, Quiz } from '@common/types';
import { saveAs } from 'file-saver';
import { Observable, Subject, of, throwError } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { QuestionService } from './question.service';

@Injectable({
    providedIn: 'root',
})
export class QuizService {
    randomId = RANDOM_ID;
    private baseURL = BASE_URL + '/quiz';
    private quizUpdateSubject = new Subject<void>();
    private quizUpdates: Observable<void> = this.quizUpdateSubject.asObservable();

    private amountOfQuestionsSubject = new Subject<number>();
    private amountOfQuestions: Observable<number> = this.amountOfQuestionsSubject.asObservable();

    // eslint-disable-next-line max-params
    constructor(
        private http: HttpClient,
        private validateService: ValidateService,
        private questionService: QuestionService,
        private notificationService: NotificationService,
    ) {}

    getAllQuizzes(): Observable<Quiz[]> {
        return this.http.get<Quiz[]>(BASE_URL + '/quiz');
    }

    getQuizById(id: string): Observable<Quiz> {
        const url = `${BASE_URL}/quiz/${id}`;
        return this.http.get<Quiz>(url);
    }

    getQuizDetailsById(id: string): Observable<Quiz> {
        if (id === this.randomId) {
            return this.getRandomQuiz();
        } else {
            return this.getQuizById(id);
        }
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
            title: quiz.title,
            description: quiz.description,
            duration: quiz.duration,
            visibility: false,
            questions: quiz.questions,
        };
        this.addNewQuiz(newQuiz as Quiz).subscribe({
            error: (error) => {
                if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.BadRequest) {
                    return this.notificationService.error('Un quiz avec ce nom existe déjà.');
                }
                this.notificationService.error("Erreur lors de l'import du quiz");
            },
        });
    }

    getQuiz(id: string, quiz: Quiz): void {
        this.getQuizById(id).subscribe({
            next: (quizToGet) => {
                quiz.title = quizToGet.title;
                quiz.duration = quizToGet.duration;
                quiz.description = quizToGet.description;
                // _id est forcé par MongoDB, accepté par le prof
                // eslint-disable-next-line no-underscore-dangle
                quiz._id = quizToGet._id;
                quiz.questions = quizToGet.questions;
                quiz.visibility = quizToGet.visibility;
                quiz.lastModification = quizToGet.lastModification;
                quiz.createdAt = quizToGet.createdAt;
                quiz = quizToGet;
                this.specifyAmountOfQuizzes(quiz.questions.length);
            },
        });
    }

    updateQuiz(updatedQuiz: Quiz, quiz: Quiz): void {
        updatedQuiz.title = quiz.title;
        updatedQuiz.description = quiz.description;
        updatedQuiz.duration = quiz.duration;
        updatedQuiz.visibility = false;
        updatedQuiz.questions = quiz.questions;
        updatedQuiz.lastModification = new Date();
        updatedQuiz.visibility = quiz.visibility;
        const validatedQuiz = this.validateService.validateQuiz(updatedQuiz).object;
        // _id est forcé par MongoDB, accepté par le prof
        // eslint-disable-next-line no-underscore-dangle
        this.updateQuizById(validatedQuiz._id, validatedQuiz).subscribe({});
    }

    hasError(quiz: Quiz): string | undefined {
        return this.validateService.validateQuiz(quiz).errors[0];
    }

    changeVisibility(quiz: Quiz): void {
        quiz.visibility = !quiz.visibility;
        // _id est forcé par MongoDB, accepté par le prof
        // eslint-disable-next-line no-underscore-dangle
        this.updateQuizById(quiz._id, quiz).subscribe({});
    }

    removeQuiz(quiz: Quiz, quizList: Quiz[]): Observable<Quiz[]> {
        const index: number = quizList.indexOf(quiz);
        // _id est forcé par MongoDB, accepté par le prof
        // eslint-disable-next-line no-underscore-dangle
        this.deleteQuizById(quizList[index]._id);
        quizList.splice(index, 1);
        return of(quizList);
    }

    generateQuizAsFile(quiz: Quiz) {
        const quizNoVisibilityNoId: Partial<Quiz> = {
            title: quiz.title,
            description: quiz.description,
            duration: quiz.duration,
            questions: quiz.questions,
            createdAt: quiz.createdAt,
            lastModification: quiz.lastModification,
        };
        const space = 2;
        const fileContent = JSON.stringify(quizNoVisibilityNoId, null, space);
        const blob = new Blob([fileContent], { type: 'application/json' });
        saveAs(blob, quiz.title + '.json');
    }

    getRandomQuiz(): Observable<Quiz> {
        return this.questionService.hasEnoughQCMQuestions(NUMBRE_OF_QCM_QUESTION).pipe(
            switchMap((hasEnough) => {
                if (hasEnough) {
                    return this.http.get<Quiz>(`${BASE_URL}/quiz/generate/random`);
                } else {
                    return throwError(() => new Error('Pas assez de questions QCM pour créer un quiz aléatoire.'));
                }
            }),
        );
    }
}
