import { UserController } from '@app/controllers/user/user.controller';
import { User, userSchema } from '@app/model/database/user';
import { UserService } from '@app/services/user/user.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: userSchema }])],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {}
