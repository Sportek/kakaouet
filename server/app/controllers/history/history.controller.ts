import { History } from '@app/model/database/history';
import { HistoryService } from '@app/services/history/history.service';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';

@Controller('History')
export class HistoryController {
    constructor(private historyService: HistoryService) {}

    @Post('/')
    @HttpCode(HttpStatus.CREATED)
    async createHistory(@Body() data: { history: History }) {
        return this.historyService.createNewHistory(data.history);
    }

    @Get('/')
    async getHistory(@Query('sortBy') sortBy: string, @Query('order') order: 'asc' | 'desc') {
        return this.historyService.getHistory(sortBy, order);
    }

    @Delete('/')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteHistory() {
        return this.historyService.deleteHistory();
    }
}
