import { GameService } from '@app/services/game/game.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway } from './game.gateway';

describe('GameGateway', () => {
    let gateway: GameGateway;
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
            providers: [
                GameGateway,
                {
                    provide: GameService,
                    useValue: mockGameService, // Utiliser le mock créé ci-dessus
                },
            ],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
