import { History } from '@app/model/database/history';
import { HistoryDto } from '@app/model/dto/history/history.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class HistoryService {
    constructor(@InjectModel(History.name) private historyModel: Model<History>) {}

    async createHistory(historyDto: HistoryDto): Promise<History> {
        const newHistory = new this.historyModel(historyDto);
        return newHistory.save();
    }
}
