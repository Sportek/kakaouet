import { GameSession } from '@app/classes/game/game-session';
import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { Game } from '@app/model/database/game';
import { Quiz } from '@app/model/database/quiz';
import { GAME_CODE_CHARACTERS, GAME_CODE_LENGTH } from '@common/constants';
import { GameRole, GameType } from '@common/types';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Server } from 'socket.io';
import { mockGame } from './mock-game';

const GAME_CODE_MAX_ATTEMPTS = 10;

@Injectable()
export class GameService {
    private gameSessions: Map<string, GameSession> = new Map();

    constructor(
        @InjectModel(Game.name) public gameModel: Model<Game>,
        @InjectModel(Quiz.name) public quizModel: Model<Quiz>,
        private readonly logger: Logger,
    ) {
        this.start();
    }

    async start() {
        if ((await this.gameModel.countDocuments()) === 0) {
            await this.populateDB();
        }
    }

    async populateDB(): Promise<void> {
        try {
            await this.gameModel.insertMany(mockGame);
            this.logger.log('DB populated with games');
        } catch (error) {
            this.logger.error('Error populating db with games: ', error);
        }
    }

    async getAllGames(): Promise<Game[]> {
        try {
            const games: Game[] = await this.gameModel.find({});
            return games;
        } catch (error) {
            this.logger.error('Error getting all games: ', error);
        }
    }

    async getGameByCode(code: string): Promise<Game> {
        try {
            const game: Game = await this.gameModel.findById(code);
            return game;
        } catch (error) {
            this.logger.error('Error getting game by id: ', error);
        }
    }

    async updateGameByCode(code: string, game: Game): Promise<Game> {
        try {
            const filter = { _id: code };
            game.updatedAt = new Date();
            await this.gameModel.replaceOne(filter, game);
            // _id est forcé par MongoDB, accepté par le prof
            // eslint-disable-next-line no-underscore-dangle
            return await this.gameModel.findOne({ _id: game._id });
        } catch (error) {
            this.logger.error('Error updating game: ', error);
        }
    }

    async deleteGameByCode(code: string): Promise<void> {
        try {
            await this.gameModel.deleteOne({ _id: code });
        } catch (error) {
            this.logger.error('Error deleting game: ', error);
        }
    }

    getGameSessionByCode(code: string): GameSession {
        return this.gameSessions.get(code);
    }

    getGameSessionBySocketId(socketId: string): GameSession {
        let gameSession: GameSession;
        this.gameSessions.forEach((game) => {
            game.room.getPlayers().forEach((player) => {
                if (player.socket.id === socketId) {
                    gameSession = game;
                }
            });
        });
        return gameSession;
    }

    async createNewGame(quizId: string, type: GameType): Promise<Game> {
        try {
            const quiz = await this.quizModel.findById(quizId);
            const newGame = new this.gameModel({
                code: await this.generateUniqueGameCode(),
                quiz,
                type,
            });
            return await newGame.save();
        } catch (error) {
            this.logger.error('Error adding new game: ', error);
        }
    }

    // eslint-disable-next-line max-params -- Ici, on a besoin de tous ces paramètres
    async createGameSession(code: string, server: Server, quizId: string, gameType: GameType): Promise<GameSession> {
        const room = new Room(code, server, this);
        const quiz = await this.quizModel.findById(quizId);
        const gameSession = new GameSession(code, room, quiz.toObject(), gameType);
        this.gameSessions.set(code, gameSession);
        return gameSession;
    }

    broadcastToGameSessions(): void {
        this.gameSessions.forEach((gameSession) => {
            const playerAmount = gameSession.room.getPlayers().length;

            const role = (player: Player) => (player.role === GameRole.Organisator ? 'O' : 'P');
            const playerNames = gameSession.room
                .getPlayers()
                .map((player) => `[${role(player)}] ${player.name}${player.isExcluded ? ' (banned)' : ''}${player.hasGiveUp ? ' (giveup)' : ''}`)
                .join(', ');

            gameSession.room.broadcast(
                'test',
                {},
                `Code: ${gameSession.code} - isLocked: ${gameSession.isLocked} - players (${playerAmount}): ${playerNames}`,
            );
        });
    }

    removeGameSession(code: string): void {
        this.gameSessions.delete(code);
    }

    private async generateUniqueGameCode(nAttemps?: number): Promise<string> {
        let code = '';
        for (let i = 0; i < GAME_CODE_LENGTH; i++) {
            code += GAME_CODE_CHARACTERS.charAt(Math.floor(Math.random() * GAME_CODE_CHARACTERS.length));
        }
        const game = await this.gameModel.findOne({ code });

        if (nAttemps && nAttemps > GAME_CODE_MAX_ATTEMPTS) {
            throw new Error('Could not generate unique game code');
        }

        if (game) return this.generateUniqueGameCode(nAttemps ? nAttemps + 1 : 1);
        return code;
    }
}
