import { HttpErrorCode } from '@app/controllers/errors';
import { UserService } from '@app/services/user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { UserController } from './user.controller';

class MockUserService {
    isLogin = jest.fn();
    login = jest.fn();
    logout = jest.fn();
}

describe('UserController', () => {
    let controller: UserController;
    let userService: MockUserService;
    let mockResponse: Response;
    let mockRequest: Request;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useClass: MockUserService,
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        userService = module.get<MockUserService>(UserService);

        mockResponse = {
            send: jest.fn(),
            status: jest.fn().mockReturnThis(),
        } as unknown as Response;

        mockRequest = {
            signedCookies: {},
            body: {},
        } as unknown as Request;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('checkLogin', () => {
        it('should return login status', async () => {
            userService.isLogin.mockResolvedValue(true);

            await controller.checkLogin(mockResponse, mockRequest);

            expect(userService.isLogin).toHaveBeenCalledWith(undefined);
            expect(mockResponse.send).toHaveBeenCalledWith({ isLogin: true });
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it('should handle error while checking login', async () => {
            userService.isLogin.mockRejectedValue(new Error('Check login failed'));

            await controller.checkLogin(mockResponse, mockRequest);

            expect(userService.isLogin).toHaveBeenCalledWith(undefined);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpErrorCode.InternalServerError);
            expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Error while checking login' });
        });
    });

    describe('login', () => {
        it('should return success status after login', async () => {
            userService.login.mockResolvedValue(true);
            mockRequest.body = { password: 'example-password' };

            await controller.login(mockResponse, mockRequest);

            expect(userService.login).toHaveBeenCalledWith(undefined, 'example-password');
            expect(mockResponse.send).toHaveBeenCalledWith({ success: true });
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it('should handle error while logging in', async () => {
            userService.login.mockRejectedValue(new Error('Login failed'));
            mockRequest.body = { password: 'example-password' };

            await controller.login(mockResponse, mockRequest);

            expect(userService.login).toHaveBeenCalledWith(undefined, 'example-password');
            expect(mockResponse.status).toHaveBeenCalledWith(HttpErrorCode.InternalServerError);
            expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Error while logging in' });
        });
    });

    describe('logout', () => {
        it('should return success status after logout', async () => {
            userService.logout.mockResolvedValue(undefined);

            await controller.logout(mockResponse, mockRequest);

            expect(userService.logout).toHaveBeenCalledWith(undefined);
            expect(mockResponse.send).toHaveBeenCalledWith({ success: true });
            expect(mockResponse.status).not.toHaveBeenCalled();
        });

        it('should handle error while logging out', async () => {
            userService.logout.mockRejectedValue(new Error('Logout failed'));

            await controller.logout(mockResponse, mockRequest);

            expect(userService.logout).toHaveBeenCalledWith(undefined);
            expect(mockResponse.status).toHaveBeenCalledWith(HttpErrorCode.InternalServerError);
            expect(mockResponse.send).toHaveBeenCalledWith({ message: 'Error while logging out' });
        });
    });
});
