import { Player } from '@app/classes/player';
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

    @SubscribeMessage(GameEvents.Disconnect)
    handleDisconnect(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (gameSession) {
            const player = gameSession.room.getPlayerWithSocketId(client.id);
            if (player && !player.isExcluded) {
                if (gameSession.gameState === GameState.WaitingPlayers) {
                    gameSession.room.removePlayer(player.name);
                } else {
                    gameSession.room.giveUpPlayer(player.name);
                }
            }
        }

        return { isSuccess: true };
    }

    @SubscribeMessage(GameEvents.SelectAnswer)
    handleSelectAnswer(@MessageBody() data: GameEventsData.SelectAnswer, @ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (gameSession) {
            const player = gameSession.room.getPlayerWithSocketId(client.id);
            if (player) {
                player.setAnswer(data.answers);
            }
        }
        return { isSuccess: true };
    }

    @SubscribeMessage(GameEvents.ConfirmAnswers)
    handleConfirmAnswers(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (gameSession) {
            const player = gameSession.room.getPlayerWithSocketId(client.id);
            if (player) {
                player.confirmAnswer();
                gameSession.room.sendToOrganizer(GameEvents.PlayerConfirmAnswers, { name: player.name });
                if (gameSession.room.allPlayerAnswered()) {
                    gameSession.timer.stop();
                }
            }
        }
        return { isSuccess: true };
    }

    @SubscribeMessage(GameEvents.JoinGame)
    handleJoinGame(@MessageBody() data: GameEventsData.JoinGame, @ConnectedSocket() client: Socket): SocketResponse {
        try {
            const gameSession = this.gameService.getGameSessionByCode(data.code);
            if (!gameSession) {
                client.emit(GameEvents.PlayerConfirmJoinGame, { code: data.code, isSuccess: false, message: "La partie n'existe pas" });
                return { isSuccess: false, message: "La partie n'existe pas" };
            }

            if (gameSession.isLocked) {
                client.emit(GameEvents.PlayerConfirmJoinGame, { code: data.code, isSuccess: false, message: 'La partie est vérouillée' });
                return { isSuccess: false, message: 'La partie est vérouillée' };
            }

            const player = gameSession.room.getPlayer(data.name);
            if (player) {
                if (player.isExcluded) {
                    client.emit(GameEvents.PlayerConfirmJoinGame, {
                        code: data.code,
                        isSuccess: false,
                        message: 'Ce pseudonyme est banni de la partie',
                    });
                    return { isSuccess: false, message: 'Ce pseudonyme est banni de la partie' };
                } else {
                    client.emit(GameEvents.PlayerConfirmJoinGame, { code: data.code, isSuccess: false, message: 'Ce nom est déjà pris' });
                    return { isSuccess: false, message: 'Ce nom est déjà pris' };
                }
            }
            gameSession.room.addPlayer(new Player(data.name, client, GameRole.Player));
        } catch (error) {
            client.emit(GameEvents.PlayerConfirmJoinGame, { code: data.code, isSuccess: false, message: 'Une erreur est survenue' });
            return { isSuccess: false, message: 'Une erreur est survenue' };
        }
    }

    @SubscribeMessage(GameEvents.CreateGame)
    async handleCreateGame(@MessageBody() data: GameEventsData.CreateGame, @ConnectedSocket() client: Socket): Promise<SocketResponse> {
        const gameSession = await this.gameService.createGameSession(data.code, this.server, data.quizId, data.gameType);
        const playerRole = data.gameType === GameType.Default ? GameRole.Organisator : GameRole.Player;
        gameSession.room.addPlayer(new Player('Organisateur', client, playerRole));
        return { isSuccess: true };
    }

    @SubscribeMessage(GameEvents.StartGame)
    handleStartGame(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player) return { isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" };
        gameSession.startGameDelayed();
        return { isSuccess: true };
    }

    @SubscribeMessage(GameEvents.GameClosed)
    handleGameClosed(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!gameSession) return { isSuccess: false, message: "La partie n'existe pas" };
        this.gameService.removeGameSession(gameSession.code);
        return { isSuccess: true };
    }

    @SubscribeMessage(GameEvents.ChangeLockedState)
    handleChangeLockState(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player) return { isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" };
        gameSession.changeGameLockState();
        return { isSuccess: true };
    }

    @SubscribeMessage(GameEvents.NextQuestion)
    handleNextQuestion(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player || player.role !== GameRole.Organisator)
            return { isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" };

        gameSession.nextQuestion();
        return { isSuccess: true };
    }

    @SubscribeMessage(GameEvents.BanPlayer)
    handleBanPlayer(@MessageBody() data: GameEventsData.BanPlayer, @ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player || player.role !== GameRole.Organisator)
            return { isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" };

        gameSession.room.banPlayer(data.name);
        return { isSuccess: true };
    }

    @SubscribeMessage(GameEvents.ToggleTimer)
    handleToggleTimer(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player || player.role !== GameRole.Organisator)
            return { isSuccess: false, message: "Vous n'êtes pas autorisé à effectuer cette action" };

        gameSession.toggleTimer();
        return { isSuccess: true };
    }

    @SubscribeMessage(GameEvents.SpeedUpTimer)
    handleSpeedUpTimer(@ConnectedSocket() client: Socket): SocketResponse {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player || player.role !== GameRole.Organisator) return;

        gameSession.speedUpTimer();
        return { isSuccess: true };
    }

    @SubscribeMessage(GameEvents.SendMessage)
    handleMessageSent(@MessageBody() data: GameEventsData.SendMessage, @ConnectedSocket() client: Socket): void {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);

        gameSession.broadcastMessage(player, data.content);
    }

    afterInit(server: Server): void {
        const INTERVAL = 1000;
        server.on('connection', (socket: Socket) => {
            socket.onAny((event) => {
                Logger.log(`SOCKET ${event} (user: ${socket.id})`);
            });
        });

        setInterval(() => {
            this.gameService.broadcastToGameSessions();
        }, INTERVAL);
    }
}
