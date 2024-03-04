import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { QuestionBankService } from '@app/services/questionBanque/questionbank.service';
import { Question } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-question-bank-import-component',
    templateUrl: './import-bank-question.component.html',
    styleUrls: ['./import-bank-question.component.scss'],
})
export class QuestionBankImportComponent implements OnInit, OnDestroy {
    @Output() questionsImported: EventEmitter<Question[]> = new EventEmitter();
    @Output() cancelImport: EventEmitter<void> = new EventEmitter();

    questionsFromBank: Question[] = [];
    selectedQuestions: Question[] = [];
    private questionsSubscription: Subscription;
    private selectedQuestionsSubscription: Subscription;
    constructor(private questionBankService: QuestionBankService) {}
    ngOnInit() {
        this.loadQuestionsFromBank();
        this.subscribeToSelectedQuestions();
    }

    ngOnDestroy(): void {
        this.questionsSubscription.unsubscribe();
        this.selectedQuestionsSubscription.unsubscribe();
    }

    loadQuestionsFromBank(): void {
        this.questionsSubscription = this.questionBankService.loadQuestionsFromBank().subscribe((questions) => {
            this.questionsFromBank = questions;
        });
    }

    subscribeToSelectedQuestions(): void {
        this.selectedQuestionsSubscription = this.questionBankService.getSelectedQuestionsObservable().subscribe((questions) => {
            this.selectedQuestions = questions;
        });
    }

    toggleQuestionSelection(question: Question): void {
        this.questionBankService.toggleQuestionSelection(question);
    }

    importQuestions(): void {
        this.questionsImported.emit(this.selectedQuestions);
        this.questionBankService.clearSelectedQuestions();
    }
    isQuestionSelected(question: Question): boolean {
        // eslint-disable-next-line no-underscore-dangle
        return this.selectedQuestions.some((selectedQuestion) => selectedQuestion._id === question._id);
    }

    cancelImportQuestions(): void {
        this.cancelImport.emit();
    }
}
