import { Component, Input, OnInit } from '@angular/core';
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

    constructor(private questionService: QuestionService) {}

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
        // Approuvé par le prof, _id spécifié par MongoDB
        // eslint-disable-next-line no-underscore-dangle
        this.questionService.deleteQuestionById(question._id).subscribe({
            next: () => {
                this.questionList.splice(this.questionList.indexOf(question), 1);
            },
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
