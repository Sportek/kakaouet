import { ChangeDetectorRef, Component, OnInit } from '@angular/core'; // chat gpt Change
import { ActivatedRoute } from '@angular/router';
// import { Question } from '@app/services/quiz/question';
import { Question, Quiz } from '@app/services/quiz/quiz';
import { QuizService } from '@app/services/quiz/quiz.service';

@Component({
    selector: 'app-descripton-page',
    templateUrl: './descripton-page.component.html',
    styleUrls: ['./descripton-page.component.scss'],
})
export class DescriptonPageComponent implements OnInit {
    game: Quiz;
    question: Question[];

    constructor(
        private quizService: QuizService,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef, // injecter ChangerDetectorRef
    ) {}

    ngOnInit() {
        const routeParams = this.route.snapshot.paramMap;
        const gameIdFromRoute = routeParams.get('gameId');
        if (gameIdFromRoute) {
            this.getQuiz(gameIdFromRoute);
        }
    }

    getQuiz(id: string): void {
        this.quizService.getQuizById(id).subscribe({
            next: (quiz) => {
                this.game = quiz;
                this.cd.detectChanges(); // detecter les chargements apres assignation
            },
        });
    }
}
