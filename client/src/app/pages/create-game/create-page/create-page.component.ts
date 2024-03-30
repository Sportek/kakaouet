import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Quiz } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-create-page',
    templateUrl: './create-page.component.html',
    styleUrls: ['./create-page.component.scss'],
})
export class CreatePageComponent implements OnInit, OnDestroy {
    games: Quiz[];
    private quizSubscription: Subscription;
    constructor(
        private quizService: QuizService,
        private dialog: MatSnackBar,
    ) {}

    ngOnInit() {
        this.getQuizzes();
    }

    ngOnDestroy() {
        if (this.quizSubscription) {
            this.quizSubscription.unsubscribe();
        }
    }

    getQuizzes(): void {
        this.quizSubscription = this.quizService.getAllQuizzes().subscribe({
            next: (quizzes) => {
                this.quizService.getRandomQuiz().subscribe({
                    next: (randomQuiz) => {
                        this.games = [randomQuiz, ...quizzes];
                    },
                    error: (error) => {
                        this.dialog.open(error, 'Fermer', {
                            duration: 3000,
                        });
                        this.games = quizzes;
                    },
                });
            },
        });
    }
}
