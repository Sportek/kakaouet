import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '@app/services/game/game.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { RANDOM_ID } from '@common/constants';
import { GameType, Question, Quiz } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-descripton-page',
    templateUrl: './descripton-page.component.html',
    styleUrls: ['./descripton-page.component.scss'],
})
export class DescriptonPageComponent implements OnInit {
    quiz: Quiz;
    ramdomId = RANDOM_ID;
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
        this.loadQuizDetails();
    }

    loadQuizDetails() {
        const quizId = this.route.snapshot.paramMap.get('gameId');
        if (!quizId) {
            this.router.navigateByUrl('/error-404');
            return;
        } else {
            this.getQuizDetails(quizId);
        }
    }

    getQuizDetails(quizId: string) {
        this.subscriptions.add(
            this.quizService.getQuizDetailsById(quizId).subscribe({
                next: (quiz) => {
                    if (!quiz) {
                        this.notificationService.error('Quiz introuvable.');
                        this.router.navigateByUrl('/error-404');
                        return;
                    }
                    this.quiz = quiz;
                    this.question = quiz.questions;
                    this.changeDetectorRef.detectChanges();
                },
                error: () => {
                    this.notificationService.error('Une erreur est survenue lors de la récupération du quiz.');
                    this.router.navigateByUrl('/error-404', { replaceUrl: true });
                },
            }),
        );
    }

    testGame(quizId: string) {
        this.gameService.createNewGame(quizId, GameType.Test);
    }

    createGame(quizId: string) {
        const gameType = quizId === this.ramdomId ? GameType.Random : GameType.Default;
        this.gameService.createNewGame(quizId, gameType);
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
