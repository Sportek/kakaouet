import { Game } from '@app/model/database/game';
import { GameService } from '@app/services/game/game.service';
import { GameType } from '@common/types';
import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post } from '@nestjs/common';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameService) {}

    @Get('/')
    async getAllGames() {
        return await this.gameService.getAllGames();
    }

    @Get('/:code')
    async getGameById(@Param('code') code: string) {
        const game = await this.gameService.getGameByCode(code);
        if (game) {
            return game;
        } else {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
    }

    @Post('/')
    @HttpCode(HttpStatus.CREATED)
    async createGame(@Body() data: { quizId: string; type: GameType }) {
        return await this.gameService.createNewGame(data.quizId, data.type);
    }

    @Patch('/:code')
    @HttpCode(HttpStatus.OK)
    async updateGame(@Param('code') code: string, @Body() game: Game) {
        return await this.gameService.updateGameByCode(code, game);
    }

    @Delete('/:code')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteGame(@Param('code') code: string) {
        await this.gameService.deleteGameByCode(code);
    }
}
