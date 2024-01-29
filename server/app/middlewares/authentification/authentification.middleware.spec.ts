import { UserService } from '@app/services/user/user.service';
import { AuthentificationMiddleware } from './authentification.middleware';

describe('AuthentificationMiddleware', () => {
    let userServiceMock: Partial<UserService>;
    let middleware: AuthentificationMiddleware;
    beforeEach(() => {
        userServiceMock = {
            // Mock des méthodes utilisées par AuthentificationMiddleware
        };
        middleware = new AuthentificationMiddleware(userServiceMock as UserService);
    });

    it('should be defined', () => {
        expect(middleware).toBeDefined();
    });
});
