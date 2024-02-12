import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '@app/components/dialog-component/dialog-delete.component';
import { QuestionService } from '@app/services/quiz/question.service';
import { Question } from '@common/types';

@Component({
    selector: 'app-bank-question',
    templateUrl: './bank-question.component.html',
    styleUrls: ['./bank-question.component.scss'],
})
export class BankQuestionComponent implements OnInit {
    @Input() visibility: string[];
    questionList: Question[] = [];

    constructor(
        private questionService: QuestionService,
        public dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.getAllQuestions();
        this.questionService.getQuestionUpdates().subscribe(() => this.getAllQuestions());
    }

    getAllQuestions() {
        this.questionService.getQuestions().subscribe({
            next: (questions) => {
                this.questionList = questions;
                this.questionList = this.questionList.sort((a: Question, b: Question) => {
                    const dateA = new Date(a.updatedAt);
                    const dateB = new Date(b.updatedAt);
                    if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
                        return dateB.getTime() - dateA.getTime();
                    } else {
                        return 0;
                    }
                });
            },
        });
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
