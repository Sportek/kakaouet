import { GameEvents, GameEventsData, GameState } from '@common/game-types';
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
            this.gameService.socketEventHandlerService.handleSendPlayerScores(data, this.gameService.players);
        });
    }

    private playerJoinGameListener() {
        this.gameService.socketService.listen(GameEvents.PlayerJoinGame, (data: GameEventsData.PlayerJoinGame) => {
            this.gameService.socketEventHandlerService.handlePlayerJoinGame(data, this.gameService.players);
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
            this.gameService.socketEventHandlerService.handleGameClosed();
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
            this.gameService.socketEventHandlerService.handleGameQuestion(
                data,
                this.gameService.actualQuestion,
                this.gameService.answer,
                this.gameService.isFinalAnswer,
            );
        });
    }

    private receiveAnswerListener() {
        this.gameService.socketService.listen(GameEvents.PlayerSelectAnswer, (data: GameEventsData.PlayerSelectAnswer) => {
            this.gameService.socketEventHandlerService.handlePlayerSelectAnswer(
                data,
                this.gameService.players,
                this.gameService.recentInteractions,
                this.gameService.cooldown.getValue(),
            );
        });
    }

    private receiveCorrectAnswersListener() {
        this.gameService.socketService.listen(GameEvents.SendCorrectAnswers, (data: GameEventsData.SendCorrectAnswers) => {
            this.gameService.correctAnswers.next(data.choices);
        });
    }

    private receiveConfirmAnswerListener() {
        this.gameService.socketService.listen(GameEvents.PlayerConfirmAnswers, (data: GameEventsData.PlayerConfirmAnswers) => {
            this.gameService.socketEventHandlerService.handlePlayerConfirmAnswers(data, this.gameService.players);
        });
    }

    private receiveUpdateScoreListener() {
        this.gameService.socketService.listen(GameEvents.UpdateScore, (data: GameEventsData.UpdateScore) => {
            this.gameService.socketEventHandlerService.handleUpdateScore(data, this.gameService.client);
        });
    }

    private receiveGameLockedStateChanged() {
        this.gameService.socketService.listen(GameEvents.GameLockedStateChanged, (data: GameEventsData.GameLockedStateChanged) => {
            this.gameService.isLocked.next(data.isLocked);
        });
    }

    private receiveBannedPlayers() {
        this.gameService.socketService.listen(GameEvents.PlayerBanned, (data: GameEventsData.PlayerBanned) => {
            this.gameService.socketEventHandlerService.handlePlayerBanned(data, this.gameService.players, this.gameService.client);
        });
    }

    private receiveMutedPlayers() {
        this.gameService.socketService.listen(GameEvents.PlayerMuted, (data: GameEventsData.PlayerMuted) => {
            this.gameService.socketEventHandlerService.handlePlayerMuted(data, this.gameService.players, this.gameService.client);
        });
    }

    private receiveGiveUpPlayers() {
        this.gameService.socketService.listen(GameEvents.PlayerHasGiveUp, (data: GameEventsData.PlayerHasGiveUp) => {
            this.gameService.socketEventHandlerService.handlePlayerGivesUp(data, this.gameService.players);
        });
    }

    private receiveSpeedUpTimer() {
        this.gameService.socketService.listen(GameEvents.GameSpeedUpTimer, () => {
            this.gameService.socketEventHandlerService.handleSpeedUpTimer();
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
