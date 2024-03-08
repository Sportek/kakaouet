import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerMiddleware } from './logger.middleware';

describe('LoggerMiddleware', () => {
    let middleware: LoggerMiddleware;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LoggerMiddleware,
                {
                    provide: Logger,
                    useValue: new Logger(),
                },
            ],
        }).compile();

        middleware = module.get<LoggerMiddleware>(LoggerMiddleware);
    });

    it('should be defined', () => {
        expect(middleware).toBeDefined();
    });
});
