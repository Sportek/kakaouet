import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { LoggerMiddleware } from './logger.middleware';

describe('LoggerMiddleware', () => {
    let middleware: LoggerMiddleware;
    let mockLogger: Logger;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: jest.Mock;

    beforeEach(async () => {
        mockLogger = new Logger();
        mockReq = {
            method: 'GET',
            baseUrl: '/test',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            signedCookies: { user_token: '123' },
        };
        mockRes = {};
        mockNext = jest.fn();

        jest.spyOn(mockLogger, 'log');

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LoggerMiddleware,
                {
                    provide: Logger,
                    useValue: mockLogger,
                },
            ],
        }).compile();

        middleware = module.get<LoggerMiddleware>(LoggerMiddleware);
    });

    it('should be defined', () => {
        expect(middleware).toBeDefined();
    });

    it('should log the request method, baseUrl, and user token', async () => {
        middleware.use(mockReq as Request, mockRes as Response, mockNext);

        expect(mockLogger.log).toHaveBeenCalledWith(`HTTP ${mockReq.method} ${mockReq.baseUrl} (user: ${mockReq.signedCookies['user_token']})`);
        expect(mockNext).toHaveBeenCalled();
    });
});
