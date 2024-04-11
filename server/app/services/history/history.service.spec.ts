import { History } from '@app/model/database/history';
import { GameRecords } from '@common/types';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
    let service: HistoryService;
    let mockHistoryModel;

    const gameRecordsArray: GameRecords[] = [
        // Add your mock game records here
    ];

    beforeEach(async () => {
        mockHistoryModel = {
            create: jest.fn().mockResolvedValue(gameRecordsArray[0]), // Mocks document creation
            // Remove the save mock if it's not needed
            find: jest.fn().mockReturnValue({
                sort: jest.fn().mockResolvedValue(gameRecordsArray),
            }),
            deleteMany: jest.fn().mockResolvedValue(true),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HistoryService,
                {
                    provide: getModelToken(History.name),
                    useValue: mockHistoryModel,
                },
                {
                    provide: Logger,
                    useValue: {
                        error: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<HistoryService>(HistoryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create new history', async () => {
        await expect(service.createNewHistory(gameRecordsArray[0])).resolves.toEqual(gameRecordsArray[0]);
        expect(mockHistoryModel.create).toHaveBeenCalledWith(gameRecordsArray[0]);
    });

    it('should handle errors when creating new history', async () => {
        mockHistoryModel.create.mockRejectedValueOnce(new Error('Some error'));
        await expect(service.createNewHistory(gameRecordsArray[0])).rejects.toThrow('Some error');
    });

    it('should get history', async () => {
        const records = await service.getHistory();
        expect(records).toEqual(gameRecordsArray);
        expect(mockHistoryModel.find().sort).toHaveBeenCalledWith({ createdAt: 1 });
    });

    it('should handle errors when fetching history', async () => {
        mockHistoryModel.find.mockReturnValue({
            sort: jest.fn().mockRejectedValueOnce(new Error('Some error')),
        });
        await expect(service.getHistory()).rejects.toThrow('Some error');
    });

    it('should delete history', async () => {
        const result = await service.deleteHistory();
        expect(result).toEqual([]);
        expect(mockHistoryModel.deleteMany).toHaveBeenCalled();
    });

    it('should handle errors when deleting history', async () => {
        mockHistoryModel.deleteMany.mockRejectedValueOnce(new Error('Some error'));
        await expect(service.deleteHistory()).rejects.toThrow('Some error');
    });
});
