import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { sortQuestionByDate } from '@app/classes/utils';
import { ConfirmationService } from '@app/services/confirmation/confirmation.service';
import { OverlayService } from '@app/services/overlay/overlay.service';
import { QuestionService } from '@app/services/quiz/question.service';
import { Question } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-bank-question',
    templateUrl: './bank-question-list.component.html',
    styleUrls: ['./bank-question-list.component.scss'],
})
export class BankQuestionListComponent implements OnInit, OnDestroy {
    @Input() visibility: string[];
    questionList: Question[] = [];
    private subscriptions: Subscription = new Subscription();

    // eslint-disable-next-line max-params -- Ils sont nécessaires
    constructor(
        private questionService: QuestionService,
        public dialog: MatDialog,
        private overlayService: OverlayService,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnInit(): void {
        this.subscriptions.add(this.questionService.getQuestionUpdates().subscribe(() => this.getAllQuestions()));
        this.getAllQuestions();
        this.overlayService.resetIsPartOfQuiz();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    getAllQuestions() {
        this.subscriptions.add(
            this.questionService.getQuestions().subscribe({
                next: (questions) => {
                    this.questionList = sortQuestionByDate(questions);
                },
            }),
        );
    }

    modifyQuestionById(id: string): void {
        this.questionService.sendId(id);
    }

    deleteQuestion(question: Question): void {
        this.confirmationService.confirm('Êtes-vous certain de vouloir supprimer cette question?', () => {
            // eslint-disable-next-line no-underscore-dangle -- accepté le prof, car mongodb utilise _id
            this.questionList = this.questionList.filter((quest) => question._id !== quest._id);
        });
    }

    isVisible(question: Question): boolean {
        for (const option in this.visibility) {
            if (this.visibility[option] === question.type) {
                return true;
            }
        }
        return false;
    }
}
