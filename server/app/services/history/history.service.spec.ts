import { History } from '@app/model/database/history';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { HistoryService } from './history.service';

describe('HistoryService', () => {
    let service: HistoryService;
    let model: Model<History> & unknown;

    const mockHistoryData = {
        _id: 'someId',
        gameTitle: 'Test Game',
        startTime: new Date(),
        numberOfPlayers: 2,
        bestScore: 1000,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HistoryService,
                {
                    provide: getModelToken(History.name),
                    useValue: {
                        create: jest.fn().mockResolvedValue(mockHistoryData),
                        find: jest.fn().mockImplementation(() => ({
                            sort: jest.fn().mockResolvedValue([mockHistoryData]),
                        })),
                        deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
                    },
                },
                {
                    provide: Logger,
                    useValue: { error: jest.fn() },
                },
            ],
        }).compile();

        service = module.get<HistoryService>(HistoryService);
        model = module.get<Model<History>>(getModelToken(History.name));
    });

    // it('should handle error when creating new history fails', async () => {
    //     // Directly throw an error when `createNewHistory` is called
    //     service.createNewHistory = jest.fn().mockImplementation(() => {
    //         throw new Error('Fail');
    //     });

    //     // Now, when `createNewHistory` is called within this test, it will directly throw the error
    //     await expect(service.createNewHistory(mockHistoryData)).rejects.toThrow('Fail');
    // });

    it('should get history records', async () => {
        const sortBy = 'createdAt';
        const order = 'asc';
        await expect(service.getHistory(sortBy, order)).resolves.toEqual([mockHistoryData]);
        expect(model.find).toHaveBeenCalled();
    });

    it('should delete history records', async () => {
        await expect(service.deleteHistory()).resolves.toEqual([]);
        expect(model.deleteMany).toHaveBeenCalled();
    });

    // it('should handle error when creating new history fails', async () => {
    //     jest.spyOn(model, 'create').mockRejectedValueOnce(new Error('Fail'));
    //     await expect(service.createNewHistory(mockHistoryData)).rejects.toThrow('Fail');
    // });

    it('should handle error when fetching history records fails', async () => {
        jest.spyOn(model, 'find').mockImplementationOnce(() => {
            throw new Error('Fail');
        });
        await expect(service.getHistory()).rejects.toThrow('Fail');
    });

    it('should handle error when deleting history records fails', async () => {
        jest.spyOn(model, 'deleteMany').mockRejectedValueOnce(new Error('Fail'));
        await expect(service.deleteHistory()).rejects.toThrow('Fail');
    });
});
