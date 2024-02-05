import { Component, OnInit } from '@angular/core';
import { QuestionService } from '@app/services/quiz/question.service';
import { Question, QuestionType } from '@common/types';

@Component({
    selector: 'app-bank-question',
    templateUrl: './bank-question.component.html',
    styleUrls: ['./bank-question.component.scss'],
})
export class BankQuestionComponent implements OnInit {
    questionList: Question[] = [];

    constructor(private questionService: QuestionService) {}

    ngOnInit(): void {
        this.questionService.getQuestions().subscribe({
            next: (questions) => {
                this.questionList = questions;
            },
        });
    }

    addQuestion(): void {
        const newQuestion: Question = {
            type: QuestionType.QCM,
            _id: 'new',
            label: 'Your new question text here',
            points: 10,
            choices: [
                { _id: 1, label: 'Option 1', isCorrect: false },
                { _id: 1, label: 'Option 2', isCorrect: true },
            ],
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Call the service to add the new question
        this.questionService.createQuestion(newQuestion).subscribe({
            next: (question) => {
                this.questionList.push(question);
            },
        });
    }
}
