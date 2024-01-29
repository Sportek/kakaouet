import { UserService } from '@app/services/user/user.service';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthentificationMiddleware implements NestMiddleware {
    constructor(private userService: UserService) {}
    async use(req: Request, res: Response, next: () => void) {
        let userToken = req.signedCookies['user_token'];
        if (!userToken) {
            userToken = uuidv4();
            this.userService.register(userToken);
            res.cookie('user_token', userToken, { signed: true, httpOnly: true, secure: true, sameSite: 'strict' });
            req.signedCookies['user_token'] = userToken;
        }

        // Update request time
        await this.userService.updateLastRequestAt(userToken);
        next();
    }
}
