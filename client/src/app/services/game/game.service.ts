/* eslint-disable max-lines */
import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BASE_URL } from '@app/constants';
import { ChatService } from '@app/services/chat/chat.service';
import { NotificationService } from '@app/services/notification/notification.service';
import { SocketService } from '@app/services/socket/socket.service';
import { SoundService } from '@app/services/sound/sound.service';
import { NEGATIVE_SCORE } from '@common/constants';
import { Variables } from '@common/enum-variables';

import {
    ActualQuestion,
    Answer,
    Client,
    GameEvents,
    GameEventsData,
    GameRestricted,
    InteractionStatus,
    PlayerClient,
    SoundType,
} from '@common/game-types';
import { Choice, Game, GameRole, GameState, GameType, QuestionType } from '@common/types';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { SocketEventHandlerService } from './socket-event-handler.service';

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
    startTime: BehaviorSubject<Date | null> = new BehaviorSubject<Date | null>(null);

    recentInteractions: Map<string, number> = new Map();

    // eslint-disable-next-line max-params -- On a besoin de tous ces paramètres
    constructor(
        private router: Router,
        private httpService: HttpClient,
        private socketService: SocketService,
        private notificationService: NotificationService,
        private chatService: ChatService,
        private socketEventHandlerService: SocketEventHandlerService, // private questionService: QuestionService,
        private soundService: SoundService,
    ) {
        this.initialise();
        this.registerListeners();
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
        this.chatService.initialize();
    }

    startGame() {
        if (!this.isLocked.getValue()) {
            return this.notificationService.error('Veuillez verrouiller la partie avant de la démarrer');
        }
        if (this.game.getValue().type === GameType.Random) {
            this.client.next({ ...this.client.getValue(), role: GameRole.Player });
            this.socketService.send(GameEvents.StartGame);
            return;
        }
        if (!this.players.getValue().filter((player) => player.role === GameRole.Player && !player.isExcluded).length) {
            return this.notificationService.error('Il doit y avoir au moins un joueur pour démarrer la partie');
        }

        this.startTime.next(new Date());
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
        if (this.getRequiredTime() > this.cooldown.getValue())
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
                this.reinitialise(quizId, game);
                this.soundService.startPlayingSound(SoundType.PlayingRoom, true);
                switch (type) {
                    case GameType.Default:
                        this.createDefaultGame(game);
                        break;
                    case GameType.Test:
                        this.createTestGame(game);
                        break;
                    case GameType.Random:
                        this.createRandomGame(game);
                        break;
                    default:
                        break;
                }
            });
    }

    nextQuestion(): void {
        this.players.getValue().forEach((player) => {
            if (player.interactionStatus !== InteractionStatus.abandoned) {
                player.interactionStatus = InteractionStatus.noInteraction;
            }
        });
        this.socketService.send(GameEvents.NextQuestion);
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

    modifyAnswerQRL(value: string): void {
        if (this.isFinalAnswer.getValue()) return;
        this.setPlayerHasAnswered(this.players.getValue().find((p) => p.name === this.client.getValue().name));
        this.answer.next(value);
        if (this.answer.getValue()) this.sendAnswer(this.answer.getValue() as Answer);
    }

    enterAnswer(text: string): void {
        if (this.isFinalAnswer.getValue()) return;
        this.answer.next(text);
        this.sendAnswer(text);
    }

    rateAnswerQRL(name: string, scoreQRL: number): void {
        const player = this.players.getValue().find((p) => p.name === name);
        if (!player) return;
        this.socketService.send(GameEvents.RateAnswerQRL, {
            playerName: name,
            score: scoreQRL,
        });
    }

    setResponseAsFinal(): void {
        if (this.isFinalAnswer.getValue()) return;
        if (this.actualQuestion.getValue()?.question?.type === QuestionType.QCM) {
            if ((this.answer.getValue() as number[]).length === 0)
                return this.notificationService.error('Veuillez sélectionner au moins une réponse');
        }
        if (this.actualQuestion.getValue()?.question?.type === QuestionType.QRL) {
            if ((this.answer.getValue() as string).trim().length === 0) return this.notificationService.error('Veuillez entrer une réponse');
            if ((this.answer.getValue() as string).trim().length > Variables.MaxCharacters)
                return this.notificationService.error('Le texte doit faire moins de 200 caractères');
        }
        this.isFinalAnswer.next(true);
        this.confirmAnswer();
    }

    banPlayer(player: PlayerClient) {
        this.socketService.send(GameEvents.BanPlayer, { name: player.name });
    }

    toggleMutePlayer(player: PlayerClient) {
        this.socketService.send(GameEvents.MutePlayer, { name: player.name });
    }

    getCorrectAnswers(): Observable<Choice[]> {
        return this.correctAnswers.asObservable();
    }

    private setPlayerHasAnswered(player: PlayerClient | undefined) {
        if (player?.answers) {
            player.answers.hasInterracted = true;
            this.players.next([...this.players.getValue()]);
        }
    }

    private reinitialise(id: string, game: Game) {
        this.initialise();
        this.socketService.connect();
        this.socketService.send(GameEvents.CreateGame, { code: game.code, quizId: id, gameType: game.type });
        this.game.next({ code: game.code, quizName: game.quiz.title, type: game.type });
    }

    private createDefaultGame(game: Game) {
        this.router.navigateByUrl('/waiting-room/' + game.code);
        this.client.next({ name: 'Organisateur', role: GameRole.Organisator, score: 0 });
    }
    private createRandomGame(game: Game) {
        this.router.navigateByUrl('/waiting-room/' + game.code);
        this.client.next({ name: 'Organisateur', role: GameRole.Organisator, score: 0 });
    }

    private createTestGame(game: Game) {
        this.router.navigateByUrl('/game/' + game.code);
        this.client.next({ name: 'Organisateur', role: GameRole.Player, score: 0 });
        this.changeLockState();
        this.isLocked.next(true);
        this.players.next([
            {
                name: 'Organisateur',
                role: GameRole.Player,
                isExcluded: false,
                score: 0,
                hasGiveUp: false,
                isMuted: false,
                interactionStatus: InteractionStatus.noInteraction,
            },
        ]);
        this.startGame();
    }

    private getRequiredTime(): number {
        return this.actualQuestion.getValue()?.question?.type === QuestionType.QCM ? Variables.QCMRequiredTimeLeft : Variables.QRLRequiredTimeLeft;
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === HttpStatusCode.NotFound) {
            this.router.navigateByUrl('/error-404', { replaceUrl: true });
            return throwError(() => new Error('Impossible to find this game'));
        }
        return throwError(() => new Error(error.message));
    }

    private resetPlayerAnswers() {
        this.recentInteractions = new Map();
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

    private handlePlayersAnswerQuestion() {
        this.resetPlayerAnswers();
        if (this.client.getValue().role === GameRole.Organisator) {
            this.router.navigate(['/organisator', this.game.getValue().code], { replaceUrl: true });
            return;
        }
        this.router.navigate(['/game', this.game.getValue().code], { replaceUrl: true });
    }

    private handleDisplayQuizResults() {
        if (this.game.getValue().type === GameType.Test) {
            this.router.navigate(['/create/'], { replaceUrl: true });
            return;
        }
        this.router.navigate(['/results', this.game.getValue().code], { replaceUrl: true });
    }

    private playerSendResultsListener() {
        this.socketService.listen(GameEvents.PlayerSendResults, (data: GameEventsData.PlayerSendResults) => {
            this.answers.next(data);
        });
    }

    private sendPlayerScoresListener() {
        this.socketService.listen(GameEvents.SendPlayersScores, (data: GameEventsData.SendPlayersScores) => {
            this.socketEventHandlerService.handleSendPlayerScores(data, this.players);
        });
    }

    private playerJoinGameListener() {
        this.socketService.listen(GameEvents.PlayerJoinGame, (data: GameEventsData.PlayerJoinGame) => {
            this.socketEventHandlerService.handlePlayerJoinGame(data, this.players);
        });
    }

    private playerQuitGameListener() {
        this.socketService.listen(GameEvents.PlayerQuitGame, (data: GameEventsData.PlayerQuitGame) => {
            this.recentInteractions.delete(data.name);
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
            this.socketEventHandlerService.handleGameClosed();
        });
    }

    private gameChangeStateListener(): void {
        this.socketService.listen(GameEvents.GameStateChanged, (data: GameEventsData.GameStateChanged) => {
            this.gameState.next(data.gameState);
            switch (data.gameState) {
                case GameState.PlayersAnswerQuestion:
                    this.handlePlayersAnswerQuestion();
                    break;
                case GameState.DisplayQuestionResults:
                    this.isFinalAnswer.next(true);
                    break;
                case GameState.DisplayQuizResults:
                    this.handleDisplayQuizResults();
                    break;
                default:
                    break;
            }
        });
    }

    private gameQuestionListener() {
        this.socketService.listen(GameEvents.GameQuestion, (data: GameEventsData.GameQuestion) => {
            this.socketEventHandlerService.handleGameQuestion(data, this.actualQuestion, this.answer, this.isFinalAnswer);
        });
    }

    private receiveAnswerListener() {
        this.socketService.listen(GameEvents.PlayerSelectAnswer, (data: GameEventsData.PlayerSelectAnswer) => {
            this.socketEventHandlerService.handlePlayerSelectAnswer(data, this.players, this.recentInteractions, this.cooldown.getValue());
        });
    }

    private receiveCorrectAnswersListener() {
        this.socketService.listen(GameEvents.SendCorrectAnswers, (data: GameEventsData.SendCorrectAnswers) => {
            this.correctAnswers.next(data.choices);
        });
    }

    private receiveConfirmAnswerListener() {
        this.socketService.listen(GameEvents.PlayerConfirmAnswers, (data: GameEventsData.PlayerConfirmAnswers) => {
            this.socketEventHandlerService.handlePlayerConfirmAnswers(data, this.players);
        });
    }

    private receiveUpdateScoreListener() {
        this.socketService.listen(GameEvents.UpdateScore, (data: GameEventsData.UpdateScore) => {
            this.socketEventHandlerService.handleUpdateScore(data, this.client);
        });
    }

    private receiveGameLockedStateChanged() {
        this.socketService.listen(GameEvents.GameLockedStateChanged, (data: GameEventsData.GameLockedStateChanged) => {
            this.isLocked.next(data.isLocked);
        });
    }

    private receiveBannedPlayers() {
        this.socketService.listen(GameEvents.PlayerBanned, (data: GameEventsData.PlayerBanned) => {
            this.socketEventHandlerService.handlePlayerBanned(data, this.players, this.client);
        });
    }

    private receiveMutedPlayers() {
        this.socketService.listen(GameEvents.PlayerMuted, (data: GameEventsData.PlayerMuted) => {
            this.socketEventHandlerService.handlePlayerMuted(data, this.players, this.client);
        });
    }

    private receiveGiveUpPlayers() {
        this.socketService.listen(GameEvents.PlayerHasGiveUp, (data: GameEventsData.PlayerHasGiveUp) => {
            this.socketEventHandlerService.handlePlayerGivesUp(data, this.players);
        });
    }

    private receiveSpeedUpTimer() {
        this.socketService.listen(GameEvents.GameSpeedUpTimer, () => {
            this.socketEventHandlerService.handleSpeedUpTimer();
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
        this.sendPlayerScoresListener();
        this.receiveGiveUpPlayers();
        this.playerSendResultsListener();
        this.receiveCorrectAnswersListener();
        this.receiveMutedPlayers();
        this.receiveSpeedUpTimer();
    }
}
