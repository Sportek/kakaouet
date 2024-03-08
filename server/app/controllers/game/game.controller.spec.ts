import { GameService } from '@app/services/game/game.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameController } from './game.controller';

describe('GameController', () => {
    let controller: GameController;
    let mockGameService: Partial<GameService>;

    beforeEach(async () => {
        mockGameService = {
            getAllGames: jest.fn(),
            getGameByCode: jest.fn(),
            createNewGame: jest.fn(),
            updateGameByCode: jest.fn(),
            deleteGameByCode: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: GameService,
                    useValue: mockGameService,
                },
            ],
        }).compile();

        controller = module.get<GameController>(GameController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
