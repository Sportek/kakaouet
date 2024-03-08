import { Game } from '@app/model/database/game';
import { Quiz } from '@app/model/database/quiz';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';

describe('GameService', () => {
    let service: GameService;

    const mockGameModel = {
        find: jest.fn(),
        findById: jest.fn(),
        replaceOne: jest.fn(),
        deleteOne: jest.fn(),
        create: jest.fn(),
        countDocuments: jest.fn(),
        insertMany: jest.fn(),
        deleteMany: jest.fn(),
    };

    const mockQuizModel = {
        find: jest.fn(),
        findById: jest.fn(),
        replaceOne: jest.fn(),
        deleteOne: jest.fn(),
        create: jest.fn(),
        countDocuments: jest.fn(),
        insertMany: jest.fn(),
        deleteMany: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameService,
                Logger,
                {
                    provide: getModelToken(Game.name),
                    useValue: mockGameModel,
                },
                {
                    provide: getModelToken(Quiz.name),
                    useValue: mockQuizModel,
                },
            ],
        }).compile();

        service = module.get<GameService>(GameService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
