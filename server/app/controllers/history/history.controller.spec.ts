import { HistoryService } from '@app/services/history/history.service';
import { Test, TestingModule } from '@nestjs/testing';
import { HistoryController } from './history.controller';

describe('HistoryController', () => {
    let controller: HistoryController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HistoryController],
            providers: [
                {
                    provide: HistoryService,
                    useValue: {
                        createNewHistory: jest.fn().mockResolvedValue({}),
                        getHistory: jest.fn().mockResolvedValue([]),
                        deleteHistory: jest.fn().mockResolvedValue([]),
                    },
                },
            ],
        }).compile();

        controller = module.get<HistoryController>(HistoryController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
