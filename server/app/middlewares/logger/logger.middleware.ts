import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(private logger: Logger) {}
    async use(req: Request, res: Response, next: () => void) {
        this.logger.log(`HTTP ${req.method} ${req.baseUrl} (user: ${req.signedCookies['user_token']})`);
        next();
    }
}
