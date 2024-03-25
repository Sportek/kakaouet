import { HistoryDto } from '@app/model/dto/history/history.dto';
import { HistoryService } from '@app/services/history/history.service';
import { Body, Controller, Post } from '@nestjs/common';

@Controller('history')
export class HistoryController {
    constructor(private historyService: HistoryService) {}

    @Post()
    async create(@Body() historyDto: HistoryDto) {
        return this.historyService.createHistory(historyDto);
    }
}
