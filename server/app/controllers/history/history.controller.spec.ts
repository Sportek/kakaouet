import { HistoryService } from '@app/services/history/history.service';
import { Test, TestingModule } from '@nestjs/testing';
import { HistoryController } from './history.controller';

describe('HistoryController', () => {
    let controller: HistoryController;
    let service: HistoryService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HistoryController],
            providers: [
                {
                    provide: HistoryService,
                    useValue: {
                        getHistory: jest.fn(),
                        deleteHistory: jest.fn().mockResolvedValue(undefined),
                    },
                },
            ],
        }).compile();

        controller = module.get<HistoryController>(HistoryController);
        service = module.get<HistoryService>(HistoryService);
    });

    it('should call getHistory with correct parameters', async () => {
        const mockSortBy = 'createdAt';
        const mockOrder = 'asc';
        await controller.getHistory(mockSortBy, mockOrder);
        expect(service.getHistory).toHaveBeenCalledWith(mockSortBy, mockOrder);
    });

    it('should call getHistory with default parameters when none are provided', async () => {
        await controller.getHistory(undefined, undefined);
        expect(service.getHistory).toHaveBeenCalledWith(undefined, undefined);
    });

    it('should call deleteHistory and return no content', async () => {
        const response = await controller.deleteHistory();
        expect(service.deleteHistory).toHaveBeenCalled();
        expect(response).toBeUndefined();
    });
});
