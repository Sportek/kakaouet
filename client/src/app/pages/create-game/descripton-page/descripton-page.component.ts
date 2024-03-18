import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '@app/services/game/game.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Variables } from '@common/enum-variables';
import { GameType, Question, Quiz } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-descripton-page',
    templateUrl: './descripton-page.component.html',
    styleUrls: ['./descripton-page.component.scss'],
})
export class DescriptonPageComponent implements OnInit {
    quiz: Quiz;
    question: Question[];
    notFound: number;
    private subscriptions = new Subscription();

    // Toutes ces dépendances sont nécessaires
    // eslint-disable-next-line max-params
    constructor(
        private quizService: QuizService,
        private route: ActivatedRoute,
        private router: Router,
        private notificationService: NotificationService,
        private changeDetectorRef: ChangeDetectorRef,
        private gameService: GameService,
    ) {}

    ngOnInit() {
        const routeParams = this.route.snapshot.paramMap;
        this.notFound = Variables.NotFound;
        const gameIdFromRoute = routeParams.get('gameId');
        if (gameIdFromRoute) this.getQuiz(gameIdFromRoute);
    }

    getQuiz(id: string): void {
        this.subscriptions.add(
            this.quizService.getQuizById(id).subscribe({
                next: (quiz) => {
                    this.quiz = quiz;
                    this.question = quiz.questions;
                    this.changeDetectorRef.detectChanges();
                },
                error: (caughtError) => {
                    if (caughtError.status === Variables.NotFound) {
                        this.router.navigateByUrl('/error-404', { replaceUrl: true });
                    }
                },
            }),
        );
    }
    testGame(quizId: string) {
        this.gameService.createNewGame(quizId, GameType.Test);
    }

    createGame(quizId: string) {
        this.gameService.createNewGame(quizId, GameType.Default);
    }

    checkQuizBeforeNavigation(gameId: string, path: string, includeId: boolean = true) {
        this.subscriptions.add(
            this.quizService.getQuizById(gameId).subscribe({
                next: (quiz) => {
                    if (quiz.visibility === false) {
                        this.notificationService.error('Ce jeu est actuellement invisible.');
                        this.router.navigate(['/create']);
                    } else if (includeId) {
                        this.router.navigate([path, gameId]);
                    } else {
                        this.router.navigate([path]);
                    }
                },
                error: (error) => {
                    if (error.status === this.notFound) {
                        this.notificationService.error('Ce jeu a été supprimé, veuillez sélectionner un autre jeu');
                        this.router.navigate(['/create']);
                    } else {
                        this.notificationService.error('Une erreur est survenue. Veuillez réessayer.');
                    }
                },
            }),
        );
    }
}
