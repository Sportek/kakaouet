import { HttpErrorCode } from '@app/controllers/errors';
import { UserService } from '@app/services/user/user.service';
import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/auth/login')
    @ApiOkResponse({
        description: 'Check if user is login as Admin',
        type: String,
    })
    async checkLogin(@Res() response: Response, @Req() request: Request) {
        try {
            const userToken = request.signedCookies['user_token'];
            const loginStatus = await this.userService.isLogin(userToken);
            return response.send({ isLogin: loginStatus });
        } catch (error) {
            return response.status(HttpErrorCode.InternalServerError).send({ message: 'Error while checking login' });
        }
    }

    @Post('/auth/login')
    @ApiOkResponse({
        description: 'Login user as Admin',
        type: String,
    })
    async login(@Res() response: Response, @Req() request: Request) {
        try {
            const { password } = request.body;
            const userToken = request.signedCookies['user_token'];
            const loginStatus = await this.userService.login(userToken, password);
            return response.send({ success: loginStatus });
        } catch (error) {
            return response.status(HttpErrorCode.InternalServerError).send({ message: 'Error while logging in' });
        }
    }

    @Get('/auth/logout')
    @ApiOkResponse({
        description: 'Logout user',
        type: String,
    })
    async logout(@Res() response: Response, @Req() request: Request) {
        try {
            const userToken = request.signedCookies['user_token'];
            await this.userService.logout(userToken);
            return response.send({ success: true });
        } catch (error) {
            return response.status(HttpErrorCode.InternalServerError).send({ message: 'Error while logging out' });
        }
    }
}
