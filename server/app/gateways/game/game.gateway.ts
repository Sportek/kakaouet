import { Player } from '@app/classes/player/player';
import { GameService } from '@app/services/game/game.service';
import { GameEvents, GameEventsData, SocketResponse } from '@common/game-types';
import { GameRole, GameState, GameType } from '@common/types';
import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class GameGateway {
    @WebSocketServer()
    server: Server;

    constructor(private gameService: GameService) {}

    // for QRL
    @SubscribeMessage(GameEvents.RateAnswerQRL)
    handleRateAnswerQRL(@MessageBody() data: GameEventsData.RateAnswerQRL, @ConnectedSocket() client: Socket): SocketResponse {
        console.log(data);
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!gameSession) return { isSuccess: false, message: "La partie n'existe pas" };

        const player = gameSession.room.getPlayer(data.playerName);
        if (!player) return { isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" };

        player.hasAnswered = true;
        player.currentQuestionMultiplier = data.score;

        if (!gameSession.room.getPlayers().some((currPlayer) => currPlayer.role === GameRole.Player && !currPlayer.hasAnswered)) {
            gameSession.displayQuestionResults();
        }
        return { isSuccess: true, message: 'La question a été notée' };
    }

    @SubscribeMessage(GameEvents.Disconnect)
    handleDisconnect(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!gameSession) return { isSuccess: false, message: "La partie n'existe pas" };

        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!(player && !player.isExcluded)) return { isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" };

        if (gameSession.gameState === GameState.WaitingPlayers) {
            gameSession.room.removePlayer(player.name);
            return { isSuccess: true, message: 'Vous avez quitté la partie' };
        }

        gameSession.room.giveUpPlayer(player.name);
        return { isSuccess: true, message: 'Vous avez abandonné la partie' };
    }

    @SubscribeMessage(GameEvents.SelectAnswer)
    handleSelectAnswer(@MessageBody() data: GameEventsData.SelectAnswer, @ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);

        if (!gameSession) return { isSuccess: false, message: "La partie n'existe pas" };

        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player) return { isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" };

        player.setAnswer(data.answers);
        return { isSuccess: true, message: 'Réponse enregistrée' };
    }

    @SubscribeMessage(GameEvents.ConfirmAnswers)
    handleConfirmAnswers(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!gameSession) return { isSuccess: false, message: "La partie n'existe pas" };

        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player) return { isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" };

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
        const playerRole = data.gameType === GameType.Default ? GameRole.Organisator : GameRole.Player;
        gameSession.room.addPlayer(new Player('Organisateur', client, playerRole));
        return { isSuccess: true, message: 'Partie créée' };
    }

    @SubscribeMessage(GameEvents.StartGame)
    handleStartGame(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player) return { isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" };
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
        if (!player) return { isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" };
        gameSession.changeGameLockState();
        return { isSuccess: true, message: 'Verrouillage de la partie modifié' };
    }

    @SubscribeMessage(GameEvents.NextQuestion)
    handleNextQuestion(@ConnectedSocket() client: Socket): SocketResponse {
        console.log('im in gate gateway in the server');
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!this.hasAutorisation(client, GameRole.Organisator))
            return { isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" };

        gameSession.nextQuestion();
        return { isSuccess: true, message: 'Question suivante' };
    }

    @SubscribeMessage(GameEvents.BanPlayer)
    handleBanPlayer(@MessageBody() data: GameEventsData.BanPlayer, @ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!this.hasAutorisation(client, GameRole.Organisator))
            return { isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" };

        gameSession.room.banPlayer(data.name);
        return { isSuccess: true, message: 'Joueur banni' };
    }

    @SubscribeMessage(GameEvents.ToggleTimer)
    handleToggleTimer(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!this.hasAutorisation(client, GameRole.Organisator))
            return { isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" };

        gameSession.toggleTimer();
        return { isSuccess: true, message: 'Timer modifié' };
    }

    @SubscribeMessage(GameEvents.SpeedUpTimer)
    handleSpeedUpTimer(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!this.hasAutorisation(client, GameRole.Organisator))
            return { isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" };
        gameSession.speedUpTimer();
        return { isSuccess: true, message: 'Timer accéléré' };
    }

    @SubscribeMessage(GameEvents.SendMessage)
    handleMessageSent(@MessageBody() data: GameEventsData.SendMessage, @ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);

        gameSession.broadcastMessage(player, data.content);
        return { isSuccess: true, message: 'Message envoyé' };
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
}
