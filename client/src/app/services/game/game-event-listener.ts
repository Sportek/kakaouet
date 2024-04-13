import { GameEvents, GameEventsData, GameState, InteractionStatus, SoundType } from '@common/game-types';
import { GameRole, GameType, QuestionType } from '@common/types';
import { GameService } from './game.service';

export class GameEventsListener {
    private static instance: GameEventsListener;

    private gameService: GameService;

    static getInstance(): GameEventsListener {
        if (!GameEventsListener.instance) {
            GameEventsListener.instance = new GameEventsListener();
        }
        return GameEventsListener.instance;
    }

    setGameService(gameService: GameService): void {
        this.gameService = gameService;
    }

    registerListeners() {
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

    private playerSendResultsListener() {
        this.gameService.socketService.listen(GameEvents.PlayerSendResults, (data: GameEventsData.PlayerSendResults) => {
            this.gameService.answers.next(data);
        });
    }

    private sendPlayerScoresListener() {
        this.gameService.socketService.listen(GameEvents.SendPlayersScores, (data: GameEventsData.SendPlayersScores) => {
            this.gameService.players.next(
                this.gameService.players.getValue().map((player) => {
                    const score = data.scores.find((s) => s.name === player.name);
                    if (score) player.score = score.score;
                    return player;
                }),
            );
        });
    }

    private playerJoinGameListener() {
        this.gameService.socketService.listen(GameEvents.PlayerJoinGame, (data: GameEventsData.PlayerJoinGame) => {
            this.gameService.players.next([
                ...this.gameService.players.getValue(),
                {
                    name: data.name,
                    role: data.role,
                    isExcluded: data.isExcluded,
                    score: data.score,
                    hasGiveUp: data.hasGiveUp,
                    isMuted: data.isMuted,
                    interactionStatus: InteractionStatus.noInteraction,
                },
            ]);
        });
    }

    private playerQuitGameListener() {
        this.gameService.socketService.listen(GameEvents.PlayerQuitGame, (data: GameEventsData.PlayerQuitGame) => {
            this.gameService.recentInteractions.delete(data.name);
            this.gameService.players.next(this.gameService.players.getValue().filter((player) => player.name !== data.name));
        });
    }

    private gameCooldownListener() {
        this.gameService.socketService.listen(GameEvents.GameCooldown, (data: GameEventsData.GameCooldown) => {
            this.gameService.cooldown.next(data.cooldown);
        });
    }

    private gameClosedListener() {
        this.gameService.socketService.listen(GameEvents.GameClosed, () => {
            this.gameService.router.navigateByUrl('/home', { replaceUrl: true });
            this.gameService.notificationService.success('La partie a été fermée');
        });
    }

    private gameChangeStateListener(): void {
        this.gameService.socketService.listen(GameEvents.GameStateChanged, (data: GameEventsData.GameStateChanged) => {
            this.gameService.gameState.next(data.gameState);
            switch (data.gameState) {
                case GameState.PlayersAnswerQuestion:
                    this.handlePlayersAnswerQuestion();
                    break;
                case GameState.DisplayQuestionResults:
                    this.gameService.isFinalAnswer.next(true);
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
        this.gameService.socketService.listen(GameEvents.GameQuestion, (data: GameEventsData.GameQuestion) => {
            this.gameService.actualQuestion.next(data.actualQuestion);
            this.gameService.answer.next(data.actualQuestion.question.type === QuestionType.QCM ? [] : '');
            this.gameService.isFinalAnswer.next(false);
        });
    }

    private receiveAnswerListener() {
        this.gameService.socketService.listen(GameEvents.PlayerSelectAnswer, (data: GameEventsData.PlayerSelectAnswer) => {
            const player = this.gameService.players.getValue().find((p) => p.name === data.name);
            if (player) {
                player.answers = { hasInterracted: true, hasConfirmed: false, answer: data.answer };
                player.interactionStatus = InteractionStatus.interacted;
                this.gameService.players.next([...this.gameService.players.getValue()]);
            }
            this.gameService.recentInteractions.set(data.name, this.gameService.cooldown.getValue());
        });
    }

    private receiveCorrectAnswersListener() {
        this.gameService.socketService.listen(GameEvents.SendCorrectAnswers, (data: GameEventsData.SendCorrectAnswers) => {
            this.gameService.correctAnswers.next(data.choices);
        });
    }

    private receiveConfirmAnswerListener() {
        this.gameService.socketService.listen(GameEvents.PlayerConfirmAnswers, (data: GameEventsData.PlayerConfirmAnswers) => {
            const player = this.gameService.players.getValue().find((p) => p.name === data.name);
            if (player) {
                if (player.answers) {
                    player.interactionStatus = InteractionStatus.finalized;
                    player.answers.hasConfirmed = true;
                }
                this.gameService.players.next([...this.gameService.players.getValue()]);
            }
        });
    }

    private receiveUpdateScoreListener() {
        this.gameService.socketService.listen(GameEvents.UpdateScore, (data: GameEventsData.UpdateScore) => {
            if (data.hasAnsweredFirst) this.gameService.notificationService.info('Vous avez répondu en premier !');
            this.gameService.client.next({ ...this.gameService.client.getValue(), score: data.score });
        });
    }

    private receiveGameLockedStateChanged() {
        this.gameService.socketService.listen(GameEvents.GameLockedStateChanged, (data: GameEventsData.GameLockedStateChanged) => {
            this.gameService.isLocked.next(data.isLocked);
        });
    }

    private receiveBannedPlayers() {
        this.gameService.socketService.listen(GameEvents.PlayerBanned, (data: GameEventsData.PlayerBanned) => {
            this.gameService.players.next(
                this.gameService.players.getValue().map((player) => (player.name === data.name ? { ...player, isExcluded: true } : player)),
            );
            if (data.name === this.gameService.client.getValue().name) {
                this.gameService.router.navigateByUrl('/home', { replaceUrl: true });
                this.gameService.notificationService.error('Vous avez été banni de la partie');
            }
        });
    }

    private receiveMutedPlayers() {
        this.gameService.socketService.listen(GameEvents.PlayerMuted, (data: GameEventsData.PlayerMuted) => {
            this.gameService.players.next(
                this.gameService.players.getValue().map((player) => (player.name === data.name ? { ...player, isMuted: data.isMuted } : player)),
            );
            if (data.name === this.gameService.client.getValue().name) {
                if (data.isMuted) {
                    this.gameService.notificationService.error("Vous n'avez pas droit de clavarder");
                } else {
                    this.gameService.notificationService.error('Vous avez le droit de clavarder a nouveau');
                }
            }
        });
    }

    private receiveGiveUpPlayers() {
        this.gameService.socketService.listen(GameEvents.PlayerHasGiveUp, (data: GameEventsData.PlayerHasGiveUp) => {
            this.gameService.players.next(
                this.gameService.players.getValue().map((player) => {
                    if (player.name === data.name) {
                        player.interactionStatus = InteractionStatus.abandoned;
                        player.hasGiveUp = true;
                    }
                    return player;
                }),
            );
        });
    }

    private receiveSpeedUpTimer() {
        this.gameService.socketService.listen(GameEvents.GameSpeedUpTimer, () => {
            this.gameService.soundService.startPlayingSound(SoundType.TimerSpeedUp);
        });
    }

    private handlePlayersAnswerQuestion() {
        this.resetPlayerAnswers();
        if (this.gameService.client.getValue().role === GameRole.Organisator) {
            this.gameService.router.navigate(['/organisator', this.gameService.game.getValue().code], { replaceUrl: true });
            return;
        }
        this.gameService.router.navigate(['/game', this.gameService.game.getValue().code], { replaceUrl: true });
    }

    private handleDisplayQuizResults() {
        if (this.gameService.game.getValue().type === GameType.Test) {
            this.gameService.router.navigate(['/create/'], { replaceUrl: true });
            return;
        }
        this.gameService.router.navigate(['/results', this.gameService.game.getValue().code], { replaceUrl: true });
    }

    private resetPlayerAnswers() {
        this.gameService.recentInteractions = new Map();
        this.gameService.players.next(
            this.gameService.players.getValue().map((player) => {
                if (player.answers)
                    player.answers = {
                        hasInterracted: false,
                        hasConfirmed: false,
                        answer: this.gameService.actualQuestion.getValue()?.question?.type === QuestionType.QCM ? [] : '',
                    };
                return player;
            }),
        );
    }
}
