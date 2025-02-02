import { GameSession } from '@app/classes/game/game-session';
import { Room } from '@app/classes/room/room';
import { Game } from '@app/model/database/game';
import { Quiz } from '@app/model/database/quiz';
import { HistoryService } from '@app/services/history/history.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { GAME_CODE_CHARACTERS, GAME_CODE_LENGTH, GAME_CODE_MAX_ATTEMPTS } from '@common/constants';
import { GameType } from '@common/types';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Server } from 'socket.io';
import { mockGame } from './mock-game';

@Injectable()
export class GameService {
    private gameSessions: Map<string, GameSession> = new Map();

    // eslint-disable-next-line max-params
    constructor(
        @InjectModel(Game.name) public gameModel: Model<Game>,
        @InjectModel(Quiz.name) public quizModel: Model<Quiz>,
        private readonly logger: Logger,
        private historyService: HistoryService,
        private quizService: QuizService,
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
            return this.gameModel.findOne({ _id: game._id });
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
        let quiz: Quiz;
        if (type === GameType.Random) {
            quiz = (await this.quizService.generateRandomQuiz()) as unknown as Quiz;
        } else {
            quiz = await this.quizModel.findById(quizId);
        }
        return this.gameModel.create({
            code: await this.generateUniqueGameCode(),
            quiz,
            type,
        });
    }
    // eslint-disable-next-line max-params -- Ici, on a besoin de tous ces paramètres
    async createGameSession(code: string, server: Server, quizId: string, gameType: GameType): Promise<GameSession> {
        const room = new Room(code, server, this);
        let quiz;
        if (gameType === GameType.Random) {
            quiz = await this.quizService.generateRandomQuiz();
        } else {
            quiz = await this.quizModel.findById(quizId);
        }
        const gameSession = new GameSession(code, room, quiz, gameType, this.historyService);
        this.gameSessions.set(code, gameSession);
        return gameSession;
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
