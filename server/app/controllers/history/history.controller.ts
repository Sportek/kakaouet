import { HistoryService } from '@app/services/history/history.service';
import { Controller, Delete, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';

@Controller('History')
export class HistoryController {
    constructor(private historyService: HistoryService) {}

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
