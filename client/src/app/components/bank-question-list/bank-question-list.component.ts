import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/dialog-component/dialog-delete.component';
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

    constructor(
        private questionService: QuestionService,
        public dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.subscriptions.add(this.questionService.getQuestionUpdates().subscribe(() => this.getAllQuestions()));
        this.getAllQuestions();
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    getAllQuestions() {
        this.subscriptions.add(
            this.questionService.getQuestions().subscribe({
                next: (questions) => {
                    this.questionList = questions.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());
                },
            }),
        );
    }

    modifyQuestionById(id: string): void {
        this.questionService.sendId(id);
    }

    deleteQuestion(question: Question): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '350px',
            data: {
                title: 'Confirmation de la suppression',
                message: 'Êtes-vous sûr de vouloir supprimer cette question?',
            },
        });

        dialogRef.afterClosed().subscribe((confirm) => {
            if (confirm) {
                // eslint-disable-next-line no-underscore-dangle
                this.questionService.deleteQuestionById(question._id).subscribe({
                    next: () => {
                        // eslint-disable-next-line no-underscore-dangle
                        this.questionList = this.questionList.filter((quest) => question._id !== quest._id);
                    },
                });
            }
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
