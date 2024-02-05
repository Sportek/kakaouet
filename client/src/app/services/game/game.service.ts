import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { QuizService } from '@app/services/quiz/quiz.service';
import { TimeService } from '@app/services/timer/time.service';
import { Timer } from '@app/services/timer/timer';
import { AnswerState, Game, GameRole, GameState, GameType, GameUser, Question } from '@common/types';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameService {
    id: string | null = null;
    game: Game | undefined;
    gameState: GameState = GameState.WaitingPlayers;
    actualQuestionIndex: number = 0;
    actualQuestion: BehaviorSubject<Question> = new BehaviorSubject<Question>({} as Question);
    timer: Timer | undefined;
    user: GameUser = {
        _id: 'player',
        isActive: true,
        isExcluded: false,
        name: 'Player',
        answerState: AnswerState.Waiting,
        role: GameRole.Player,
        score: 0,
    };
    answers: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
    selectedChoices: number[] = [];
    canChangeChoices: boolean = true;

    constructor(
        private router: Router,
        private quizService: QuizService,
        private timeService: TimeService,
    ) {}

    async init(id: string | null) {
        this.id = id;
        if (this.router.url.includes('testing') && id) {
            await this.setupFakeGame(id);
        }
        this.nextQuestion(0);
        this.executeState(this.gameState);
    }

    /**
     * Permet de créer une game de test avec un quiz contenue dans l'URL. */
    async setupFakeGame(id: string) {
        return new Promise<void>((resolve) => {
            this.quizService
                .getQuizById(id)
                .pipe(catchError((error) => this.handleError(error)))
                .subscribe((quiz) => {
                    this.game = {
                        _id: 'test',
                        type: GameType.Test,
                        code: 'FAKE',
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        isLocked: true,
                        messages: [],
                        quiz,
                        users: [
                            {
                                _id: 'organisator',
                                isActive: true,
                                isExcluded: false,
                                name: 'Organisator',
                                answerState: AnswerState.Waiting,
                                role: GameRole.Player,
                                score: 0,
                            },
                        ],
                    };
                    resolve();
                });
        });
    }
    executeState(gameState: GameState) {
        this.gameState = gameState;
        switch (gameState) {
            case GameState.WaitingPlayers:
                // TODO: Pour le prochain sprint
                this.executeState(GameState.PlayersAnswerQuestion);
                break;
            case GameState.PlayersAnswerQuestion:
                this.playersAnswerQuestion();
                break;
            case GameState.OrganisatorCorrectingAnswers:
                this.organisatorCorrectingAnswers();
                break;
            case GameState.DisplayQuestionResults:
                this.displayQuestionResults();
                break;
            case GameState.DisplayQuizResults:
                break;
            case GameState.End:
                break;
            default:
                throw new Error('Invalid game state');
        }
    }

    /*
     * Permet de set la question actuelle, soit en prenant la prochaine, soit en prenant celle à l'index donné.
     * @return true si la question a été changée */
    nextQuestion(index?: number) {
        if (!this.game) return false;
        if (index === undefined) {
            if (!(this.actualQuestionIndex < this.game.quiz.questions.length - 1)) return false;
            index = ++this.actualQuestionIndex;
        }
        this.resetQuestion();
        this.actualQuestion.next(this.game.quiz.questions[index]);
        return true;
    }

    resetQuestion() {
        this.canChangeChoices = true;
        this.selectedChoices = [];
    }

    isSelected(index: number) {
        return this.selectedChoices.includes(index);
    }

    getCorrectAnswers(): Observable<number[]> {
        return this.answers;
    }

    selectChoice(index: number) {
        if (!this.canChangeChoices) return;
        if (this.selectedChoices.includes(index)) {
            this.selectedChoices = this.selectedChoices.filter((choice) => choice !== index);
        } else {
            this.selectedChoices.push(index);
        }
    }

    // Envoyer les choix sélectionnés par le joueur au serveur
    sendSelectedChoices() {
        return true;
    }

    giveUp() {
        // TODO: Traiter le cas où le joueur abandonne (sprint 2)
        if (!this.id) return;
        this.router.navigateByUrl('/create/description/' + this.id);
    }

    /*
     * Phase de réponse aux questions par les joueurs*/
    private playersAnswerQuestion() {
        if (!this.game) return;
        // Démarrer le timer de réponse à la question
        this.timer = this.timeService.createTimer(
            'game',
            new Timer(this.game.quiz.duration, {
                whenDone: () => this.executeState(GameState.OrganisatorCorrectingAnswers),
            }),
        );
    }

    /*
     * Phase de correction des réponses par l'organisateur */
    private organisatorCorrectingAnswers() {
        this.canChangeChoices = false;
        this.executeState(GameState.DisplayQuestionResults);
    }

    private correctAnswers() {
        // TODO: Faire la requête au serveur pour savoir quel réponses sont bonnes.
        if (this.user) {
            this.sendSelectedChoices();
            this.user.score += this.actualQuestion.value.points;
        }
    }

    private displayQuestionResults() {
        if (this.game?.type === GameType.Test) this.correctAnswers();
        // TODO: Faire la requête au serveur pour savoir quel réponses sont bonnes.
        this.answers.next([0]);
        const hasNextQuestion = this.nextQuestion();
        if (hasNextQuestion) return this.executeState(GameState.PlayersAnswerQuestion);
        return this.executeState(GameState.DisplayQuizResults);
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === HttpStatusCode.NotFound) {
            this.router.navigateByUrl('/error-404', { replaceUrl: true });
            return throwError(() => new Error('Impossible to find this game'));
        }
        return throwError(() => new Error(error.message));
    }
}
