import { History } from '@app/model/database/history';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
    let service: HistoryService;
    let mockHistoryModel;

    const mockHistoryRecord = {
        gameTitle: 'Test Game',
        startTime: new Date(),
        numberOfPlayers: 1,
        bestScore: 100,
    } as History;

    beforeEach(async () => {
        mockHistoryModel = {
            new: jest.fn().mockResolvedValue(mockHistoryRecord),
            constructor: jest.fn().mockResolvedValue(mockHistoryRecord),
            find: jest.fn(),
            sort: jest.fn(),
            save: jest.fn(),
            deleteMany: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HistoryService,
                {
                    provide: getModelToken(History.name),
                    useValue: mockHistoryModel,
                },
                Logger,
            ],
        }).compile();

        service = module.get<HistoryService>(HistoryService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
