import { User, UserDocument } from '@app/model/database/user';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

const PASSWORD = 'LOG2990-109';
@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async register(token: string) {
        await this.userModel.create({ token });
    }

    async updateLastRequestAt(token: string) {
        await this.userModel.updateOne({ token }, { lastRequestAt: new Date() });
    }

    async login(token: string, password: string) {
        const isCorrect = password === PASSWORD;
        if (isCorrect) {
            await this.userModel.updateOne({ token }, { $set: { isAdminAuthentified: true } });
        }
        return isCorrect;
    }

    async logout(token: string) {
        await this.userModel.updateOne({ token }, { $set: { isAdminAuthentified: false } });
    }

    async isLogin(token: string) {
        return (await this.userModel.findOne({ token })).isAdminAuthentified === true;
    }
}
