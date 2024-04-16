import { Player } from '@app/classes/player/player';
import { GameService } from '@app/services/game/game.service';
import { GameEvents, GameEventsData, SocketResponse } from '@common/game-types';
import { GameRole, GameState, GameType } from '@common/types';
import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const UNAUTHORIZED = { isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" };

@WebSocketGateway({ cors: true })
export class GameGateway {
    @WebSocketServer()
    server: Server;

    constructor(private gameService: GameService) {}

    @SubscribeMessage(GameEvents.RateAnswerQRL)
    handleRateAnswerQRL(@MessageBody() data: GameEventsData.RateAnswerQRL, @ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!gameSession) {
            return this.generateErrorResponse("La partie n'existe pas");
        }
        const player = gameSession.room.getPlayer(data.playerName);
        if (!player) {
            return this.generateErrorResponse("Vous n'êtes pas autorisé à effectuer cette action");
        }
        gameSession.saveAnswerRatings(player, data.score);
        if (this.shouldDisplayResults(gameSession)) {
            gameSession.displayQuestionResults();
        }
        return { isSuccess: true, message: 'La question a été notée' };
    }

    @SubscribeMessage(GameEvents.Disconnect)
    handleDisconnect(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!gameSession) return { isSuccess: false, message: "La partie n'existe pas" };

        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!(player && !player.isExcluded)) return UNAUTHORIZED;

        gameSession.broadcastMessage('Joueur ' + player.name + " n'est plus dans la partie.");
        if (gameSession.gameState === GameState.WaitingPlayers) {
            gameSession.room.removePlayer(player.name);
            return { isSuccess: true, message: 'Vous avez quitté la partie' };
        }
        gameSession.room.giveUpPlayer(player.name);

        if (gameSession.gameState === GameState.OrganisatorCorrectingAnswers && this.shouldDisplayResults(gameSession)) {
            gameSession.displayQuestionResults();
        }

        if (gameSession.room.allPlayerAnswered()) gameSession.timer.stop();
        return { isSuccess: true, message: 'Vous avez abandonné la partie' };
    }

    @SubscribeMessage(GameEvents.SelectAnswer)
    handleSelectAnswer(@MessageBody() data: GameEventsData.SelectAnswer, @ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!gameSession) return { isSuccess: false, message: "La partie n'existe pas" };

        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player) return UNAUTHORIZED;

        player.setAnswer(data.answers);
        return { isSuccess: true, message: 'Réponse enregistrée' };
    }

    @SubscribeMessage(GameEvents.ConfirmAnswers)
    handleConfirmAnswers(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!gameSession) return { isSuccess: false, message: "La partie n'existe pas" };

        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player) return UNAUTHORIZED;

        player.confirmAnswer();
        gameSession.room.sendToOrganizer(GameEvents.PlayerConfirmAnswers, { name: player.name });
        if (gameSession.room.allPlayerAnswered()) gameSession.timer.stop();
        return { isSuccess: true, message: 'Réponse confirmée' };
    }

    @SubscribeMessage(GameEvents.JoinGame)
    handleJoinGame(@MessageBody() data: GameEventsData.JoinGame, @ConnectedSocket() client: Socket): SocketResponse {
        const response = this.verifyJoinGame(data);
        if (!response.isSuccess) {
            client.emit(GameEvents.PlayerConfirmJoinGame, { code: data.code, ...response });
        } else {
            const gameSession = this.gameService.getGameSessionByCode(data.code);
            gameSession.room.addPlayer(new Player(data.name, client, GameRole.Player));
        }
        return { isSuccess: response.isSuccess };
    }

    @SubscribeMessage(GameEvents.CreateGame)
    async handleCreateGame(@MessageBody() data: GameEventsData.CreateGame, @ConnectedSocket() client: Socket): Promise<SocketResponse> {
        const gameSession = await this.gameService.createGameSession(data.code, this.server, data.quizId, data.gameType);
        const playerRole = data.gameType === GameType.Default || data.gameType === GameType.Random ? GameRole.Organisator : GameRole.Player;
        gameSession.room.addPlayer(new Player('Organisateur', client, playerRole));
        return { isSuccess: true, message: 'Partie créée' };
    }

    @SubscribeMessage(GameEvents.StartGame)
    handleStartGame(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player) return UNAUTHORIZED;
        gameSession.startGameDelayed();
        return { isSuccess: true, message: 'Partie démarrée' };
    }

    @SubscribeMessage(GameEvents.GameClosed)
    handleGameClosed(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!gameSession) return { isSuccess: false, message: "La partie n'existe pas" };
        this.gameService.removeGameSession(gameSession.code);
        return { isSuccess: true, message: 'Partie fermée' };
    }

    @SubscribeMessage(GameEvents.ChangeLockedState)
    handleChangeLockState(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player) return UNAUTHORIZED;
        gameSession.changeGameLockState();
        return { isSuccess: true, message: 'Verrouillage de la partie modifié' };
    }

    @SubscribeMessage(GameEvents.NextQuestion)
    handleNextQuestion(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!this.hasAutorisation(client, GameRole.Organisator)) return UNAUTHORIZED;

        gameSession.nextQuestion();
        return { isSuccess: true, message: 'Question suivante' };
    }

    @SubscribeMessage(GameEvents.BanPlayer)
    handleBanPlayer(@MessageBody() data: GameEventsData.BanPlayer, @ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!this.hasAutorisation(client, GameRole.Organisator)) return UNAUTHORIZED;

        gameSession.broadcastMessage('Joueur ' + data.name + " n'est plus dans la partie.");
        gameSession.room.banPlayer(data.name);
        return { isSuccess: true, message: 'Joueur banni' };
    }

    @SubscribeMessage(GameEvents.MutePlayer)
    handleMutedPlayer(@MessageBody() data: GameEventsData.MutePlayer, @ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!this.hasAutorisation(client, GameRole.Organisator)) return UNAUTHORIZED;
        gameSession.room.mutePlayer(data.name);
        if (player.isMuted) {
            return { isSuccess: true, message: 'Droit au clavardage activé' };
        } else {
            return { isSuccess: true, message: 'Droit au clavardage desactivé' };
        }
    }

    @SubscribeMessage(GameEvents.ToggleTimer)
    handleToggleTimer(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!this.hasAutorisation(client, GameRole.Organisator)) return UNAUTHORIZED;

        gameSession.toggleTimer();
        return { isSuccess: true, message: 'Timer modifié' };
    }

    @SubscribeMessage(GameEvents.SpeedUpTimer)
    handleSpeedUpTimer(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!this.hasAutorisation(client, GameRole.Organisator)) return UNAUTHORIZED;
        gameSession.speedUpTimer();
        return { isSuccess: true, message: 'Timer accéléré' };
    }

    @SubscribeMessage(GameEvents.SendMessage)
    handleMessageSent(@MessageBody() data: GameEventsData.SendMessage, @ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player.isMuted) {
            gameSession.broadcastMessage(data.content, player);
            return { isSuccess: true, message: 'Message envoyé' };
        }
        client.emit(GameEvents.MutedNotification, { message: "Vous n'êtes pas autorisé à effectuer cette action" });
        return { isSuccess: false, message: 'Non-authorisé' };
    }

    afterInit(server: Server): void {
        server.on('connection', (socket: Socket) => {
            socket.onAny((event) => {
                Logger.log(`SOCKET ${event} (user: ${socket.id})`);
            });
        });
    }

    private verifyJoinGame(data: GameEventsData.JoinGame): SocketResponse {
        const gameSession = this.gameService.getGameSessionByCode(data.code);
        if (!gameSession) {
            return { isSuccess: false, message: "La partie n'existe pas" };
        }
        if (gameSession.isLocked) {
            return { isSuccess: false, message: 'La partie est vérouillée' };
        }
        const player = gameSession.room.getPlayer(data.name);
        if (player && player.isExcluded) {
            return { isSuccess: false, message: 'Ce pseudonyme est banni de la partie' };
        }
        if (player) {
            return { isSuccess: false, message: 'Ce nom est déjà pris' };
        }
        return { isSuccess: true };
    }

    private hasAutorisation(client: Socket, role: GameRole): boolean {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        return player && player.role === role;
    }

    private generateErrorResponse(message: string): SocketResponse {
        return { isSuccess: false, message };
    }

    private shouldDisplayResults(gameSession): boolean {
        return !gameSession.room.getPlayers().some((player) => player.role === GameRole.Player && !player.hasAnswered && !player.hasGiveUp);
    }
}
