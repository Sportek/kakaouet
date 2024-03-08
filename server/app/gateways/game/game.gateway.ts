import { Player } from '@app/classes/player';
import { GameService } from '@app/services/game/game.service';
import { GameEvents, GameEventsData } from '@common/game-types';
import { GameRole, GameState } from '@common/types';
import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class GameGateway {
    @WebSocketServer()
    server: Server;

    constructor(private gameService: GameService) {}

    @SubscribeMessage(GameEvents.Disconnect)
    handleDisconnect(@ConnectedSocket() client: Socket): void {
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
    }

    @SubscribeMessage(GameEvents.SelectAnswer)
    handleSelectAnswer(@MessageBody() data: GameEventsData.SelectAnswer, @ConnectedSocket() client: Socket): void {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (gameSession) {
            const player = gameSession.room.getPlayerWithSocketId(client.id);
            if (player) {
                player.setAnswer(data.answers);
            }
        }
    }

    @SubscribeMessage(GameEvents.ConfirmAnswers)
    handleConfirmAnswers(@ConnectedSocket() client: Socket): void {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (gameSession) {
            const player = gameSession.room.getPlayerWithSocketId(client.id);
            if (player) {
                player.confirmAnswer();
                gameSession.room.sendToOrganizer(GameEvents.PlayerConfirmAnswers, { name: player.name });
                if (gameSession.room.allPlayerAnswered()) {
                    gameSession.room.sendToOrganizer(GameEvents.AllPlayersAnswered);
                }
            }
        }
    }

    @SubscribeMessage(GameEvents.JoinGame)
    handleJoinGame(@MessageBody() data: GameEventsData.JoinGame, @ConnectedSocket() client: Socket): void {
        try {
            const gameSession = this.gameService.getGameSessionByCode(data.code);
            if (!gameSession) {
                client.emit(GameEvents.PlayerConfirmJoinGame, { code: data.code, isSuccess: false, message: "La partie n'existe pas" });
                return;
            }

            if (gameSession.isLocked) {
                client.emit(GameEvents.PlayerConfirmJoinGame, { code: data.code, isSuccess: false, message: 'La partie est vérouillée' });
                return;
            }

            const player = gameSession.room.getPlayer(data.name);
            if (player) {
                if (player.isExcluded) {
                    client.emit(GameEvents.PlayerConfirmJoinGame, {
                        code: data.code,
                        isSuccess: false,
                        message: 'Ce pseudonyme est banni de la partie',
                    });
                    return;
                } else {
                    client.emit(GameEvents.PlayerConfirmJoinGame, { code: data.code, isSuccess: false, message: 'Ce nom est déjà pris' });
                    return;
                }
            }
            gameSession.room.addPlayer(new Player(data.name, client, GameRole.Player));
        } catch (error) {
            client.emit(GameEvents.PlayerConfirmJoinGame, { code: data.code, isSuccess: false, message: 'Une erreur est survenue' });
        }
    }

    @SubscribeMessage(GameEvents.CreateGame)
    async handleCreateGame(@MessageBody() data: GameEventsData.CreateGame, @ConnectedSocket() client: Socket): Promise<void> {
        const gameSession = await this.gameService.createGameSession(data.code, this.server, data.quizId);
        gameSession.room.addPlayer(new Player('Organisateur', client, GameRole.Organisator));
    }

    @SubscribeMessage(GameEvents.StartGame)
    handleStartGame(@ConnectedSocket() client: Socket): void {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player || player.role !== GameRole.Organisator) {
            return;
        }

        gameSession.startGame();
    }

    @SubscribeMessage(GameEvents.GameClosed)
    handleGameClosed(@ConnectedSocket() client: Socket): void {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        if (!gameSession) return;
        this.gameService.removeGameSession(gameSession.code);
    }

    @SubscribeMessage(GameEvents.ChangeLockedState)
    handleChangeLockState(@ConnectedSocket() client: Socket): void {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player || player.role !== GameRole.Organisator) return;

        gameSession.changeGameLockState();
    }

    @SubscribeMessage(GameEvents.NextQuestion)
    handleNextQuestion(@ConnectedSocket() client: Socket): void {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player || player.role !== GameRole.Organisator) return;

        gameSession.nextQuestion();
    }

    @SubscribeMessage(GameEvents.BanPlayer)
    handleBanPlayer(@MessageBody() data: GameEventsData.BanPlayer, @ConnectedSocket() client: Socket): void {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player || player.role !== GameRole.Organisator) return;

        gameSession.room.banPlayer(data.name);
    }

    @SubscribeMessage(GameEvents.ToggleTimer)
    handleToggleTimer(@ConnectedSocket() client: Socket): void {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player || player.role !== GameRole.Organisator) return;

        gameSession.toggleTimer();
    }

    @SubscribeMessage(GameEvents.SpeedUpTimer)
    handleSpeedUpTimer(@ConnectedSocket() client: Socket): void {
        const gameSession = this.gameService.getGameSessionBySocketId(client.id);
        const player = gameSession.room.getPlayerWithSocketId(client.id);
        if (!player || player.role !== GameRole.Organisator) return;

        gameSession.speedUpTimer();
    }

    afterInit(server: Server): void {
        server.on('connection', (socket: Socket) => {
            socket.onAny((event) => {
                Logger.log(`SOCKET ${event} (user: ${socket.id})`);
            });
        });

        setInterval(() => {
            this.gameService.broadcastToGameSessions();
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        }, 1000);
    }
}
