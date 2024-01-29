import { Component, OnInit } from '@angular/core';
// import { games } from 'src/tempory-games';
import { Quiz } from '@app/services/quiz/quiz';
import { QuizService } from '@app/services/quiz/quiz.service';

@Component({
    selector: 'app-create-page',
    templateUrl: './create-page.component.html',
    styleUrls: ['./create-page.component.scss'],
})
export class CreatePageComponent implements OnInit {
    // games = [...games];
    games: Quiz[];
    constructor(private quizService: QuizService) {}

    ngOnInit() {
        this.getQuizzes();
    }

    getQuizzes(): void {
        this.quizService.getAllQuizzes().subscribe({
            next: (quizzes) => {
                this.games = quizzes;
            },
        });
    }
}
