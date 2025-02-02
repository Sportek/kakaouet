import { History } from '@app/model/database/history';
import { GameRecords } from '@common/types';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class HistoryService {
    constructor(
        @InjectModel(History.name) private historyModel: Model<History>,
        private readonly logger: Logger,
    ) {}

    async createNewHistory(historyData: GameRecords): Promise<GameRecords> {
        try {
            const newHistory = await this.historyModel.create(historyData);
            return newHistory;
        } catch (error) {
            this.logger.error('Error adding new history: ', error);
            throw error;
        }
    }

    async getHistory(sortBy: string = 'createdAt', order: 'asc' | 'desc' = 'asc'): Promise<GameRecords[]> {
        try {
            const sortObject = {};

            // Ces nombres sont une utilisation standard de MongoDB, reconnus et attendus dans le contexte des opérations de tri.
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            sortObject[sortBy] = order === 'asc' ? 1 : -1;

            const historyRecords = await this.historyModel.find({}).sort(sortObject);
            return historyRecords;
        } catch (error) {
            this.logger.error('Error fetching history records: ', error);
            throw error;
        }
    }

    async deleteHistory(): Promise<GameRecords[]> {
        try {
            await this.historyModel.deleteMany({});
        } catch (error) {
            this.logger.error('Error deleting history records: ', error);
            throw error;
        }
        return [];
    }
}
