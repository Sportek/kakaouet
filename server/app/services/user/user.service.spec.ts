import { User } from '@app/model/database/user';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';

describe('UserService', () => {
    let service: UserService;

    const mockUserModel = {
        create: jest.fn(),
        updateOne: jest.fn(),
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        it('should register a user', async () => {
            await service.register('sample-token');
            expect(mockUserModel.create).toHaveBeenCalledWith({ token: 'sample-token' });
        });

        it('should handle errors during registration', async () => {
            mockUserModel.create.mockRejectedValueOnce(new Error('Registration failed'));
            await expect(service.register('sample-token')).rejects.toThrowError('Registration failed');
        });
    });

    describe('updateLastRequestAt', () => {
        it('should update lastRequestAt for a user', async () => {
            await service.updateLastRequestAt('sample-token');
            expect(mockUserModel.updateOne).toHaveBeenCalledWith({ token: 'sample-token' }, { lastRequestAt: expect.any(Date) });
        });

        it('should handle errors during last request update', async () => {
            mockUserModel.updateOne.mockRejectedValueOnce(new Error('Update failed'));
            await expect(service.updateLastRequestAt('sample-token')).rejects.toThrowError('Update failed');
        });
    });

    describe('login', () => {
        it('should login a user with correct password', async () => {
            await service.login('sample-token', 'LOG2990-109');
            expect(mockUserModel.updateOne).toHaveBeenCalledWith({ token: 'sample-token' }, { $set: { isAdminAuthentified: true } });
        });

        it('should not login a user with incorrect password', async () => {
            const result = await service.login('sample-token', 'incorrect-password');
            expect(result).toBe(false);
        });
    });

    describe('logout', () => {
        it('should logout a user', async () => {
            await service.logout('sample-token');
            expect(mockUserModel.updateOne).toHaveBeenCalledWith({ token: 'sample-token' }, { $set: { isAdminAuthentified: false } });
        });

        it('should handle errors during logout', async () => {
            mockUserModel.updateOne.mockRejectedValueOnce(new Error('Logout failed'));
            await expect(service.logout('sample-token')).rejects.toThrowError('Logout failed');
        });
    });

    describe('isLogin', () => {
        it('should check if a user is logged in', async () => {
            mockUserModel.findOne.mockResolvedValueOnce({ isAdminAuthentified: true });
            const result = await service.isLogin('sample-token');
            expect(result).toBe(true);
        });

        it('should handle errors during isLogin', async () => {
            mockUserModel.findOne.mockRejectedValueOnce(new Error('User not found'));
            await expect(service.isLogin('sample-token')).rejects.toThrowError('User not found');
        });
    });
});
