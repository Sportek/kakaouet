import { GameSession } from '@app/classes/game/game-session';
import { Player } from '@app/classes/player/player';
import { GameService } from '@app/services/game/game.service';
import { GameEvents, PlayerClient } from '@common/game-types';
import { GameRole, GameState, GameType } from '@common/types';
import { Server } from 'socket.io';

interface BroadcastOptions {
    exceptRoom?: string;
}
export class Room {
    code: string;
    players: Player[];
    // Double link to GameSession
    private game: GameSession;
    private gameService: GameService;
    private server: Server;
    constructor(code: string, server: Server, gameService: GameService) {
        this.code = code;
        this.server = server;
        this.gameService = gameService;
        this.players = [];
    }

    banPlayer(playerName: string) {
        const player = this.getPlayer(playerName);
        this.broadcast(GameEvents.PlayerBanned, {}, { name: playerName });
        player.isExcluded = true;
        player.leaveAllRooms();
    }

    mutePlayer(playerName: string) {
        const player = this.getPlayer(playerName);
        player.isMuted = !player.isMuted;
        this.broadcast(GameEvents.PlayerMuted, {}, { name: playerName, isMuted: player.isMuted });
    }

    giveUpPlayer(playerName: string) {
        const player = this.getPlayer(playerName);
        player.hasGiveUp = true;
        player.leaveAllRooms();
        this.broadcast(GameEvents.PlayerHasGiveUp, {}, { name: playerName });
        this.shouldDeleteGame();
    }

    addPlayer(player: Player): void {
        player.leaveAllRooms();
        player.joinRoom(this.code);
        this.players.push(player);
        player.setRoom(this);
        player.send(GameEvents.PlayerConfirmJoinGame, {
            code: this.code,
            isSuccess: true,
            game: { code: this.game.code, quizName: this.game.quiz.title, type: this.game.type },
            players: this.players.map(
                (p) =>
                    ({
                        name: p.name,
                        role: p.role,
                        isExcluded: p.isExcluded,
                        score: p.score,
                    }) as PlayerClient,
            ),
        });
        this.broadcast(
            GameEvents.PlayerJoinGame,
            { exceptRoom: player.socket.id },
            { name: player.name, role: player.role, score: player.score, isExcluded: player.isExcluded },
        );
    }

    getPlayer(playerName: string): Player {
        return this.players.find((player) => player.name.toLowerCase() === playerName.toLowerCase());
    }

    removePlayer(playerName: string): void {
        const player = this.getPlayer(playerName);
        this.players = this.players.filter((p) => p.name !== playerName);
        player.leaveAllRooms();
        this.broadcast(GameEvents.PlayerQuitGame, { exceptRoom: player.socket.id }, { name: playerName });
        this.shouldDeleteGame();
    }

    deleteRoom(): void {
        this.broadcast(GameEvents.GameClosed, {});
        this.players.forEach((p) => p.leaveRoom(this.code));
        this.gameService.removeGameSession(this.code);
    }

    broadcast(event: string, options: BroadcastOptions, ...args: unknown[]): void {
        this.server
            .to(this.code)
            .except(options.exceptRoom)
            .emit(event, ...args);
    }

    changeOrganisatorToPlayer(): void {
        const organisators = this.players.filter((p) => p.role === GameRole.Organisator);
        organisators.forEach((organisator) => {
            organisator.role = GameRole.Player;
        });
    }

    sendToOrganizer(event: string, ...args: unknown[]): void {
        const organizer = this.players.find((p) => p.role === GameRole.Organisator);
        if (organizer) {
            organizer.send(event, ...args);
        }
    }

    getPlayers(): Player[] {
        return this.players;
    }

    getPlayersExceptOrganizer(): Player[] {
        return this.players.filter((player) => player.role !== GameRole.Organisator);
    }

    getOnlyGamePlayers(): Player[] {
        return this.players.filter((player) => player.role === GameRole.Player && !player.isExcluded);
    }

    getPlayerWithSocketId(socketId: string): Player {
        return this.players.find((player) => player.socket.id === socketId);
    }

    setGame(game: GameSession): void {
        this.game = game;
    }

    getGame(): GameSession {
        return this.game;
    }

    allPlayerAnswered(): boolean {
        return this.getOnlyGamePlayers().every((player) => player.hasGiveUp || player.getAnswer(this.game.gameQuestionIndex)?.hasConfirmed);
    }

    getPlayingPlayers(): Player[] {
        return this.getOnlyGamePlayers().filter((player) => !player.hasGiveUp);
    }

    getOrganisator(): Player {
        return this.players.find((p) => p.role === GameRole.Organisator && !p.hasGiveUp);
    }

    private isRandomGame() {
        return this.game.type === GameType.Random;
    }

    private isWaitingPlayersPhase() {
        return this.game.gameState === GameState.WaitingPlayers;
    }

    private shouldDeleteGame(): void {
        const noPlayers = !(this.getPlayingPlayers().length > 0) && this.game.gameState !== GameState.WaitingPlayers;
        const noOrganisator = !this.getOrganisator() && this.game.type !== GameType.Test;
        const shouldConsiderOrganisator = this.isRandomGame() && !this.isWaitingPlayersPhase() ? false : noOrganisator;
        if (noPlayers || shouldConsiderOrganisator) this.deleteRoom();
    }
}
