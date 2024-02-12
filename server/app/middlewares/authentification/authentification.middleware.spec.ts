import { UserService } from '@app/services/user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { AuthentificationMiddleware } from './authentification.middleware';

class MockUserService {
    register = jest.fn().mockImplementation((token: string) => {
        if (token === 'existing-token') {
            throw new Error('Registration failed');
        }
    });

    updateLastRequestAt = jest.fn().mockImplementation((token: string) => {
        if (token === 'existing-token') {
            throw new Error('Update failed');
        }
    });

    isTokenExist = jest.fn().mockImplementation((token: string) => {
        return token !== 'another-token';
    });
}

describe('AuthentificationMiddleware', () => {
    let middleware: AuthentificationMiddleware;
    let userService: UserService;
    let mockRequest: Request;
    let mockResponse: Response;
    let mockNext: jest.Mock;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthentificationMiddleware,
                {
                    provide: UserService,
                    useClass: MockUserService,
                },
            ],
        }).compile();

        middleware = module.get<AuthentificationMiddleware>(AuthentificationMiddleware);
        userService = module.get<UserService>(UserService);

        mockRequest = {
            signedCookies: {},
        } as unknown as Request;

        mockResponse = {
            cookie: jest.fn(),
        } as unknown as Response;

        mockNext = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(middleware).toBeDefined();
    });

    it('should create a new user token and register the user if not present in cookies', async () => {
        await middleware.use(mockRequest, mockResponse, mockNext);

        expect(userService.register).toHaveBeenCalledTimes(1);
        expect(mockResponse.cookie).toHaveBeenCalledWith('user_token', expect.any(String), {
            signed: true,
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });
        expect(mockRequest.signedCookies['user_token']).toEqual(expect.any(String));
        expect(userService.updateLastRequestAt).toHaveBeenCalledTimes(1);
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during updating last request time', async () => {
        const existingUserToken = 'existing-token';
        mockRequest.signedCookies['user_token'] = existingUserToken;

        await expect(middleware.use(mockRequest, mockResponse, mockNext)).rejects.toThrowError('Update failed');

        expect(userService.register).not.toHaveBeenCalled();
        expect(mockResponse.cookie).not.toHaveBeenCalled();
        expect(userService.updateLastRequestAt).toHaveBeenCalledWith(existingUserToken);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors during updating last request time and continue execution', async () => {
        const existingUserToken = 'other-token';
        mockRequest.signedCookies['user_token'] = existingUserToken;

        await middleware.use(mockRequest, mockResponse, mockNext);

        expect(userService.register).not.toHaveBeenCalled();
        expect(mockResponse.cookie).not.toHaveBeenCalled();
        expect(userService.updateLastRequestAt).toHaveBeenCalledWith(existingUserToken);
        expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should handle normal execution with an existing user token', async () => {
        const existingUserToken = 'other-token';
        mockRequest.signedCookies['user_token'] = existingUserToken;

        await middleware.use(mockRequest, mockResponse, mockNext);

        expect(userService.register).not.toHaveBeenCalled();
        expect(mockResponse.cookie).not.toHaveBeenCalled();
        expect(userService.updateLastRequestAt).toHaveBeenCalledWith(existingUserToken);
        expect(mockNext).toHaveBeenCalledTimes(1);
    });
});
