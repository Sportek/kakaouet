import { DateController } from '@app/controllers/date/date.controller';
import { ExampleController } from '@app/controllers/example/example.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { Course, courseSchema } from '@app/model/database/course';
import { DateService } from '@app/services/date/date.service';
import { ExampleService } from '@app/services/example/example.service';
import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as cookieParser from 'cookie-parser';
import { AuthentificationMiddleware } from './middlewares/authentification/authentification.middleware';
import { UserModule } from './modules/user/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([{ name: Course.name, schema: courseSchema }]),
        UserModule,
    ],
    controllers: [DateController, ExampleController],
    providers: [ChatGateway, DateService, ExampleService, Logger, AuthentificationMiddleware],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(cookieParser(process.env.COOKIE_SECRET)).forRoutes('*');
        consumer.apply(AuthentificationMiddleware).forRoutes('*');
    }
}
