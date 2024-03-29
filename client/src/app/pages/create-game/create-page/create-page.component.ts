import { Component, OnDestroy, OnInit } from '@angular/core';
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
    constructor(private quizService: QuizService) {}

    ngOnInit() {
        this.getQuizzes();
        this.initializeRandomQuiz();
    }

    ngOnDestroy() {
        if (this.quizSubscription) {
            this.quizSubscription.unsubscribe();
        }
    }

    getQuizzes(): void {
        this.quizSubscription = this.quizService.getAllQuizzes().subscribe({
            next: (quizzes) => {
                this.games = quizzes;
            },
        });
    }

    initializeRandomQuiz() {
        this.quizService.createOrUpdateRandomQuiz().subscribe({
            next: (randomQuiz) => {
                if (randomQuiz) {
                    this.games.unshift(randomQuiz);
                }
            },
            error: (error) => {
                console.error('Erreur lors de la création ou de la mise à jour du quiz aléatoire', error);
            },
        });
    }
}
