import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as cookieParser from 'cookie-parser';
import { QuestionController } from './controllers/question/question.controller';
import { QuizController } from './controllers/quiz/quiz.controller';
import { AuthentificationMiddleware } from './middlewares/authentification/authentification.middleware';
// import { Game, gameSchema } from './model/database/game';
import { Question, questionSchema } from './model/database/question';
import { Quiz, quizSchema } from './model/database/quiz';
import { UserModule } from './modules/user/user.module';
import { QuestionService } from './services/question/question.service';
import { QuizService } from './services/quiz/quiz.service';

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
        MongooseModule.forFeature([{ name: Quiz.name, schema: quizSchema }]),
        MongooseModule.forFeature([{ name: Question.name, schema: questionSchema }]),
        // MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
        UserModule,
    ],
    controllers: [QuizController, QuestionController],
    providers: [QuizService, QuestionService, Logger, AuthentificationMiddleware],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(cookieParser(process.env.COOKIE_SECRET)).forRoutes('*');
        consumer.apply(AuthentificationMiddleware).forRoutes('*');
    }
}
