import { Component, OnInit } from '@angular/core';
import { ConfirmationService } from '@app/services/confirmation/confirmation.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Quiz } from '@common/types';

@Component({
    selector: 'app-quiz',
    templateUrl: './quiz.component.html',
    styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent implements OnInit {
    quizList: Quiz[];

    constructor(
        private quizService: QuizService,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnInit() {
        this.getListQuestions();
        this.quizService.getQuizUpdates().subscribe(() => this.getListQuestions());
    }

    getListQuestions() {
        this.quizService.getAllQuizzes().subscribe({
            next: (quizzes) => {
                this.quizList = quizzes;
            },
        });
    }

    changeVisibility(quiz: Quiz): void {
        this.quizService.changeVisibility(quiz);
    }

    removeQuiz(quiz: Quiz): void {
        this.confirmationService.confirm('Êtes-vous certain de vouloir supprimer ce quiz?', () => {
            this.quizService.removeQuiz(quiz, this.quizList);
        });
    }

    generateQuizAsFile(quiz: Quiz) {
        this.quizService.generateQuizAsFile(quiz);
    }
}
