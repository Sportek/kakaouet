import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { QuestionService } from '@app/services/quiz/question.service';
import { Question } from '@common/types';

@Component({
    selector: 'app-question-bank-import-component',
    templateUrl: './importer-questions-banque.component.html',
    styleUrls: ['./importer-questions-banque.component.scss'],
})
export class QuestionBankImportComponent implements OnInit {
    @Output() questionsImported: EventEmitter<Question[]> = new EventEmitter();
    @Output() cancelImport: EventEmitter<void> = new EventEmitter();

    questionsFromBank: Question[] = [];
    selectedQuestions: Set<Question> = new Set();
    constructor(private questionService: QuestionService) {}

    ngOnInit() {
        this.loadQuestionsFromBank();
    }

    loadQuestionsFromBank(): void {
        this.questionService.getQuestions().subscribe({
            next: (questions) => {
                this.questionsFromBank = questions;
            },
        });
    }
    cancelImportQuestions(): void {
        this.cancelImport.emit();
    }

    toggleQuestionSelection(question: Question): void {
        if (this.selectedQuestions.has(question)) {
            this.selectedQuestions.delete(question);
        } else {
            this.selectedQuestions.add(question);
        }
    }

    importQuestions(): void {
        this.questionsImported.emit(Array.from(this.selectedQuestions));
        this.selectedQuestions.clear();
    }
}
