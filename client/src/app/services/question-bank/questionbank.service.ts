import { Injectable } from '@angular/core';
import { QuestionService } from '@app/services/quiz/question.service';
import { Question } from '@common/types';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class QuestionBankService {
    private selectedQuestions: Set<Question> = new Set();
    private selectedQuestionsSubject: BehaviorSubject<Question[]> = new BehaviorSubject<Question[]>([]);

    constructor(private questionService: QuestionService) {}

    loadQuestionsFromBank(): Observable<Question[]> {
        return this.questionService.getQuestions();
    }

    toggleQuestionSelection(question: Question): void {
        if (this.selectedQuestions.has(question)) {
            this.selectedQuestions.delete(question);
        } else {
            this.selectedQuestions.add(question);
        }
        this.selectedQuestionsSubject.next(Array.from(this.selectedQuestions));
    }

    getSelectedQuestionsObservable(): Observable<Question[]> {
        return this.selectedQuestionsSubject.asObservable();
    }

    clearSelectedQuestions(): void {
        this.selectedQuestions.clear();
        this.selectedQuestionsSubject.next([]);
    }
}
