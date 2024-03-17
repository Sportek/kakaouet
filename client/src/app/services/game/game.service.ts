/* eslint-disable max-lines */
import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BASE_URL } from '@app/constants';
import { ChatService } from '@app/services/chat/chat.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { SocketService } from '@app/services/socket/socket.service';
import { NEGATIVE_SCORE } from '@common/constants';
import { ActualQuestion, Answer, Client, GameEvents, GameEventsData, GameRestricted, PlayerClient } from '@common/game-types';
import { Choice, Game, GameRole, GameState, GameType, QuestionType } from '@common/types';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';

const QCM_REQUIRED_TIME_LEFT = 10;
const QRL_REQUIRED_TIME_LEFT = 20;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    players: BehaviorSubject<PlayerClient[]>;
    client: BehaviorSubject<Client>;
    cooldown: BehaviorSubject<number>;
    game: BehaviorSubject<GameRestricted>;
    actualQuestion: BehaviorSubject<ActualQuestion | null>;
    gameState: BehaviorSubject<GameState>;
    isFinalAnswer: BehaviorSubject<boolean>;
    answer: BehaviorSubject<Answer | null>;
    isLocked: BehaviorSubject<boolean>;
    answers: BehaviorSubject<GameEventsData.PlayerSendResults>;
    correctAnswers: BehaviorSubject<Choice[]>;

    canGoNextQuestion: boolean;

    // eslint-disable-next-line max-params -- On a besoin de tous ces paramètres
    constructor(
        private router: Router,
        private httpService: HttpClient,
        private socketService: SocketService,
        private notificationService: NotificationService,
        private chatService: ChatService,
    ) {
        this.initialise();
        this.registerListeners();

        // Évènement de test pour vérifier qu'on est connecté au serveur
        this.socketService.listen('test', (data) => {
            // eslint-disable-next-line no-console -- Nécessaire pour le débug message dans la console.
            console.log(data);
        });
    }

    initialise() {
        this.players = new BehaviorSubject<PlayerClient[]>([]);
        this.client = new BehaviorSubject<Client>({ name: '', role: GameRole.Organisator, score: 0 });
        this.cooldown = new BehaviorSubject<number>(NEGATIVE_SCORE);
        this.game = new BehaviorSubject<GameRestricted>({ code: '', quizName: '', type: GameType.Default });
        this.actualQuestion = new BehaviorSubject<ActualQuestion | null>(null);
        this.gameState = new BehaviorSubject<GameState>(GameState.WaitingPlayers);
        this.isFinalAnswer = new BehaviorSubject<boolean>(false);
        this.answer = new BehaviorSubject<Answer | null>(null);
        this.isLocked = new BehaviorSubject<boolean>(false);
        this.answers = new BehaviorSubject<GameEventsData.PlayerSendResults>({ choices: [], scores: [], questions: [] });
        this.correctAnswers = new BehaviorSubject<Choice[]>([]);
        this.canGoNextQuestion = true;
        this.chatService.initialize();
    }

    startGame() {
        if (!this.isLocked.getValue()) return this.notificationService.error('Veuillez verrouiller la partie avant de la démarrer');
        if (!this.players.getValue().filter((player) => player.role === GameRole.Player && !player.isExcluded).length)
            return this.notificationService.error('Il doit y avoir au moins un joueur pour démarrer la partie');
        this.socketService.send(GameEvents.StartGame);
    }

    changeLockState() {
        this.socketService.send(GameEvents.ChangeLockedState);
    }

    sendAnswer(answer: Answer) {
        this.socketService.send(GameEvents.SelectAnswer, { answers: answer });
    }

    isLastQuestion(): boolean {
        const actualQuestion = this.actualQuestion.getValue();
        if (!actualQuestion) return false;
        return actualQuestion.actualIndex === actualQuestion.totalQuestion - 1;
    }

    confirmAnswer() {
        this.socketService.send(GameEvents.ConfirmAnswers);
    }

    filterPlayers(): PlayerClient[] {
        return this.players.getValue().filter((player) => player.role === GameRole.Player && !player.isExcluded);
    }

    toggleTimer() {
        this.socketService.send(GameEvents.ToggleTimer);
    }

    speedUpTimer() {
        const requiredTime = this.actualQuestion.getValue()?.question?.type === QuestionType.QCM ? QCM_REQUIRED_TIME_LEFT : QRL_REQUIRED_TIME_LEFT;
        if (requiredTime < this.cooldown.getValue())
            return this.notificationService.error('Le temps requis minimum pour accélérer le timer est dépassé');
        this.socketService.send(GameEvents.SpeedUpTimer);
    }

    giveUp() {
        this.router.navigateByUrl('/home', { replaceUrl: true });
    }

    createNewGame(quizId: string, type: GameType): void {
        this.httpService
            .post<Game>(BASE_URL + '/game/', { quizId, type })
            .pipe(catchError((error) => this.handleError(error)))
            .subscribe((game) => {
                this.initialise();
                this.socketService.connect();
                this.socketService.send(GameEvents.CreateGame, { code: game.code, quizId, gameType: game.type });
                this.game.next({ code: game.code, quizName: game.quiz.name, type: game.type });
                if (type === GameType.Default) {
                    this.router.navigateByUrl('/waiting-room/' + game.code);
                    this.client.next({ name: 'Organisateur', role: GameRole.Organisator, score: 0 });
                } else {
                    this.router.navigateByUrl('/game/' + game.code);
                    this.client.next({ name: 'Organisateur', role: GameRole.Player, score: 0 });
                    this.changeLockState();
                    this.isLocked.next(true);
                    this.players.next([{ name: 'Organisateur', role: GameRole.Player, isExcluded: false, score: 0, hasGiveUp: false }]);
                    this.startGame();
                }
            });
    }

    nextQuestion(): void {
        if (this.canGoNextQuestion) {
            this.canGoNextQuestion = false;
            this.socketService.send(GameEvents.NextQuestion);
        }
    }

    selectAnswer(index: number): void {
        if (this.isFinalAnswer.getValue()) return;
        const answer = this.answer.getValue() as number[];
        if (answer.includes(index)) {
            this.answer.next(answer.filter((i) => i !== index));
        } else {
            this.answer.next([...answer, index]);
        }

        const newAnswer = this.answer.getValue();
        if (newAnswer) this.sendAnswer(newAnswer);
    }

    setResponseAsFinal(): void {
        if (this.isFinalAnswer.getValue()) return;
        if (this.actualQuestion.getValue()?.question?.type === QuestionType.QCM) {
            const answer = this.answer.getValue() as number[];
            if (answer.length === 0) return this.notificationService.error('Veuillez sélectionner au moins une réponse');
        }
        this.isFinalAnswer.next(true);
        this.confirmAnswer();
    }

    banPlayer(player: PlayerClient) {
        this.socketService.send(GameEvents.BanPlayer, { name: player.name });
    }

    getCorrectAnswers(): Observable<Choice[]> {
        return this.correctAnswers.asObservable();
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === HttpStatusCode.NotFound) {
            this.router.navigateByUrl('/error-404', { replaceUrl: true });
            return throwError(() => new Error('Impossible to find this game'));
        }
        return throwError(() => new Error(error.message));
    }

    private resetPlayerAnswers() {
        this.players.next(
            this.players.getValue().map((player) => {
                if (player.answers)
                    player.answers = {
                        hasInterracted: false,
                        hasConfirmed: false,
                        answer: this.actualQuestion.getValue()?.question?.type === QuestionType.QCM ? [] : '',
                    };
                return player;
            }),
        );
    }

    private playerJoinGameListener() {
        this.socketService.listen(GameEvents.PlayerJoinGame, (data: GameEventsData.PlayerJoinGame) => {
            this.players.next([
                ...this.players.getValue(),
                { name: data.name, role: data.role, isExcluded: data.isExcluded, score: data.score, hasGiveUp: data.hasGiveUp },
            ]);
        });
    }

    private playerQuitGameListener() {
        this.socketService.listen(GameEvents.PlayerQuitGame, (data: GameEventsData.PlayerQuitGame) => {
            this.players.next(this.players.getValue().filter((player) => player.name !== data.name));
        });
    }

    private gameCooldownListener() {
        this.socketService.listen(GameEvents.GameCooldown, (data: GameEventsData.GameCooldown) => {
            this.cooldown.next(data.cooldown);
        });
    }

    private gameClosedListener() {
        this.socketService.listen(GameEvents.GameClosed, () => {
            this.router.navigateByUrl('/home', { replaceUrl: true });
            this.notificationService.success('La partie a été fermée');
        });
    }

    private gameChangeStateListener(): void {
        this.socketService.listen(GameEvents.GameStateChanged, (data: GameEventsData.GameStateChanged) => {
            this.gameState.next(data.gameState);

            if (data.gameState === GameState.PlayersAnswerQuestion) {
                this.canGoNextQuestion = true;
                this.resetPlayerAnswers();
                if (this.client.getValue().role === GameRole.Organisator) {
                    this.router.navigate(['/organisator', this.game.getValue().code], { replaceUrl: true });
                    return;
                }
                this.router.navigate(['/game', this.game.getValue().code], { replaceUrl: true });
            }

            if (data.gameState === GameState.DisplayQuestionResults) {
                this.isFinalAnswer.next(true);
            }

            if (data.gameState === GameState.DisplayQuizResults) {
                if (this.game.getValue().type === GameType.Test) {
                    this.router.navigate(['/create/'], { replaceUrl: true });
                    return;
                }

                this.router.navigate(['/results', this.game.getValue().code], { replaceUrl: true });
            }
        });
    }

    private gameQuestionListener() {
        this.socketService.listen(GameEvents.GameQuestion, (data: GameEventsData.GameQuestion) => {
            this.actualQuestion.next(data.actualQuestion);
            this.answer.next(data.actualQuestion.question.type === QuestionType.QCM ? [] : '');
            this.isFinalAnswer.next(false);
        });
    }

    private receiveAnswerListener() {
        this.socketService.listen(GameEvents.PlayerSelectAnswer, (data: GameEventsData.PlayerSelectAnswer) => {
            const player = this.players.getValue().find((p) => p.name === data.name);
            if (player) {
                player.answers = { hasInterracted: true, hasConfirmed: false, answer: data.answer };
                this.players.next([...this.players.getValue()]);
            }
        });
    }

    private receiveCorrectAnswersListener() {
        this.socketService.listen(GameEvents.SendCorrectAnswers, (data: GameEventsData.SendCorrectAnswers) => {
            this.correctAnswers.next(data.choices);
        });
    }

    private receiveConfirmAnswerListener() {
        this.socketService.listen(GameEvents.PlayerConfirmAnswers, (data: GameEventsData.PlayerConfirmAnswers) => {
            const player = this.players.getValue().find((p) => p.name === data.name);
            if (player) {
                if (player.answers) {
                    player.answers.hasConfirmed = true;
                }
                this.players.next([...this.players.getValue()]);
            }
        });
    }

    private receiveUpdateScoreListener() {
        this.socketService.listen(GameEvents.UpdateScore, (data: GameEventsData.UpdateScore) => {
            if (data.hasAnsweredFirst) this.notificationService.info('Vous avez répondu en premier !');
            this.client.next({ ...this.client.getValue(), score: data.score });
        });
    }

    private receiveGameLockedStateChanged() {
        this.socketService.listen(GameEvents.GameLockedStateChanged, (data: GameEventsData.GameLockedStateChanged) => {
            this.isLocked.next(data.isLocked);
        });
    }

    private receiveBannedPlayers() {
        this.socketService.listen(GameEvents.PlayerBanned, (data: GameEventsData.PlayerBanned) => {
            this.players.next(this.players.getValue().map((player) => (player.name === data.name ? { ...player, isExcluded: true } : player)));
            if (data.name === this.client.getValue().name) {
                this.router.navigateByUrl('/home', { replaceUrl: true });
                this.notificationService.error('Vous avez été banni de la partie');
            }
        });
    }

    private receivePlayerScores() {
        this.socketService.listen(GameEvents.SendPlayersScores, (data: GameEventsData.SendPlayersScores) => {
            this.players.next(
                this.players.getValue().map((player) => {
                    const score = data.scores.find((s) => s.name === player.name);
                    if (score) player.score = score.score;
                    return player;
                }),
            );
        });
    }

    private receiveGiveUpPlayers() {
        this.socketService.listen(GameEvents.PlayerHasGiveUp, (data: GameEventsData.PlayerHasGiveUp) => {
            this.players.next(
                this.players.getValue().map((player) => {
                    if (player.name === data.name) player.hasGiveUp = true;
                    return player;
                }),
            );
        });
    }

    private receiveGameResults() {
        this.socketService.listen(GameEvents.PlayerSendResults, (data: GameEventsData.PlayerSendResults) => {
            this.answers.next(data);
        });
    }

    private registerListeners() {
        this.playerJoinGameListener();
        this.playerQuitGameListener();
        this.gameCooldownListener();
        this.gameClosedListener();
        this.gameChangeStateListener();
        this.gameQuestionListener();
        this.receiveAnswerListener();
        this.receiveConfirmAnswerListener();
        this.receiveUpdateScoreListener();
        this.receiveGameLockedStateChanged();
        this.receiveBannedPlayers();
        this.receivePlayerScores();
        this.receiveGiveUpPlayers();
        this.receiveGameResults();
        this.receiveCorrectAnswersListener();
    }
}
