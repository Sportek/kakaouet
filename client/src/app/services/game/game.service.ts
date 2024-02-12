import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { QuizService } from '@app/services/quiz/quiz.service';
import { TimeService } from '@app/services/timer/time.service';
import { Timer } from '@app/services/timer/timer';
import { AnswerState, Game, GameRole, GameState, GameType, GameUser, Question } from '@common/types';
import { BehaviorSubject, Observable, catchError, firstValueFrom, throwError } from 'rxjs';

const INCREMENTE_SCORE = 1.2;
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
        this.resetGame();
        this.id = id;
        if (this.router.url.includes('testing') && id) {
            await this.setupFakeGame(id);
        }
        this.nextQuestion(0);
        this.executeState(this.gameState);
    }

    sendMessage(message: string) {
        // TODO: Pour l'instant c'est un "faux" message, aucun envoie en backend, en attente pour le sprint 2 ou 3.
        this.game?.messages.push({
            content: message,
            createdAt: new Date(),
            // eslint-disable-next-line no-underscore-dangle
            gameUserId: 'organisator',
        });
    }

    resetGame() {
        this.id = null;
        this.game = undefined;
        this.gameState = GameState.WaitingPlayers;
        this.actualQuestionIndex = 0;
        this.actualQuestion.next({} as Question);
        this.timer = undefined;
        this.user = {
            _id: 'player',
            isActive: true,
            isExcluded: false,
            name: 'Player',
            answerState: AnswerState.Waiting,
            role: GameRole.Player,
            score: 0,
        };
    }

    /**
     * Permet de créer une game de test avec un quiz contenue dans l'URL. */
    async setupFakeGame(id: string) {
        return new Promise<void>((resolve) => {
            const organisator = {
                _id: 'organisator',
                isActive: true,
                isExcluded: false,
                name: 'Organisator',
                answerState: AnswerState.Waiting,
                role: GameRole.Player,
                score: 0,
            };
            this.user = organisator;

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
                        users: [organisator],
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
                this.displayQuizResults();
                break;
            case GameState.End:
                this.gameEnd();
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

    private async correctAnswers() {
        if (this.user && this.game) {
            const values = await firstValueFrom(
                // eslint-disable-next-line no-underscore-dangle
                this.quizService.correctQuizAnswers(this.game.quiz._id, this.actualQuestionIndex, this.selectedChoices),
            );
            this.answers.next(values.correctChoicesIndices);
            this.user.score += values.points * INCREMENTE_SCORE;
        }
    }

    private displayQuestionResults() {
        if (this.game?.type === GameType.Test) this.correctAnswers();
        this.answers.next([0]);

        this.timer = this.timeService.createTimer(
            'cooldown',
            new Timer(3, {
                whenDone: () => {
                    const hasNextQuestion = this.nextQuestion();
                    let nextGameState = GameState.DisplayQuizResults;
                    if (hasNextQuestion) nextGameState = GameState.PlayersAnswerQuestion;
                    this.executeState(nextGameState);
                },
            }),
        );
    }

    private displayQuizResults() {
        this.executeState(GameState.End);
    }

    private gameEnd() {
        if (!this.game) return;
        if (this.game.type === GameType.Test) {
            // eslint-disable-next-line no-underscore-dangle
            this.router.navigateByUrl('/create/description/' + this.game.quiz._id);
        }
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === HttpStatusCode.NotFound) {
            this.router.navigateByUrl('/error-404', { replaceUrl: true });
            return throwError(() => new Error('Impossible to find this game'));
        }
        return throwError(() => new Error(error.message));
    }
}
