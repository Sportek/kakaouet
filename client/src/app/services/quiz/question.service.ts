import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BASE_URL } from '@app/constants';
import { NotificationService } from '@app/services/notification/notification.service';
import { Question, QuestionType, Quiz } from '@common/types';
import { Observable, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    private idSubject = new Subject<string>();
    private id$: Observable<string> = this.idSubject.asObservable();

    private questionUpdateSubject = new Subject<void>();
    private questionUpdates: Observable<void> = this.questionUpdateSubject.asObservable();

    private baseURL = BASE_URL + '/question';

    constructor(
        private http: HttpClient,
        private dialog: MatSnackBar,
        private notificationService: NotificationService,
    ) {}

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

    deleteQuestionById(id: string): void {
        const url = `${this.baseURL}/${id}`;
        this.http.delete<void>(url).subscribe({});
    }

    removeQuestion(question: Question, quiz: Quiz) {
        const index: number = quiz.questions.indexOf(question);
        if (index >= 0) quiz.questions.splice(index, 1);
    }

    moveQuestionUp(index: number, quiz: Quiz): void {
        if (index > 0) {
            const temp = quiz.questions[index];
            quiz.questions[index] = quiz.questions[index - 1];
            quiz.questions[index - 1] = temp;
            quiz.questions = [...quiz.questions];
        }
    }

    moveQuestionDown(index: number, quiz: Quiz): void {
        if (index < quiz.questions.length - 1) {
            const temp = quiz.questions[index];
            quiz.questions[index] = quiz.questions[index + 1];
            quiz.questions[index + 1] = temp;
            quiz.questions = [...quiz.questions];
        }
    }

    handleQuestionsImported(importedQuestions: Question[], quiz: Quiz): void {
        const newQuestions = importedQuestions.filter(
            // _id est forcé par MongoDB, accepté par le prof
            // eslint-disable-next-line no-underscore-dangle
            (importedQuestion) => !quiz.questions.some((existingQuestion) => existingQuestion.text === importedQuestion.text),
        );
        // _id est forcé par MongoDB, accepté par le prof
        // eslint-disable-next-line no-underscore-dangle
        quiz.questions = [...quiz.questions, ...newQuestions];
    }

    importQuestionToBank(question: Question): void {
        const partialQuestionNoId: Partial<Question> = {
            text: question.text,
            points: question.points,
            createdAt: question.createdAt,
            lastModification: question.lastModification,
            type: question.type,
        };
        if (partialQuestionNoId.type === 'QCM' && question.type === 'QCM') partialQuestionNoId.choices = question.choices;
        this.getQuestions().subscribe((questionsFromBank: Question[]) => {
            const questionExistsInBank = questionsFromBank.some((existingQuestion: Question) => existingQuestion.text === partialQuestionNoId.text);
            if (!questionExistsInBank) {
                this.createQuestion(partialQuestionNoId as Question).subscribe({});
                this.dialog.open('La question a bien été exporté à la banque de question', 'Fermer', {
                    duration: 3000,
                });
            } else {
                this.dialog.open('La question existe déjà dans la banque de question', 'Fermer', {
                    duration: 3000,
                });
            }
        });
    }

    onQuestionListUpdate(modifiedQuestion: Question, quiz: Quiz, isPatch: boolean) {
        // _id est forcé par MongoDB, accepté par le prof
        // eslint-disable-next-line no-underscore-dangle
        const index = quiz.questions.findIndex((question) => question.text === modifiedQuestion.text);
        if (index < 0) {
            quiz.questions.push(modifiedQuestion);
        } else {
            if (!isPatch) return this.notificationService.error("La question n'a pas été ajoutée car une question du même titre existe déjà");
            quiz.questions[index] = modifiedQuestion;
        }
    }
    hasEnoughQCMQuestions(minimumCount: number): Observable<boolean> {
        return this.getQuestions().pipe(map((questions) => questions.filter((q) => q.type === QuestionType.QCM).length >= minimumCount));
    }
}
