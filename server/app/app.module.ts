import { Logger, MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import * as cookieParser from 'cookie-parser';
import { GameController } from './controllers/game/game.controller';
import { QuestionController } from './controllers/question/question.controller';
import { QuizController } from './controllers/quiz/quiz.controller';
import { GameGateway } from './gateways/game/game.gateway';
import { AuthentificationMiddleware } from './middlewares/authentification/authentification.middleware';
import { LoggerMiddleware } from './middlewares/logger/logger.middleware';
import { Game, gameSchema } from './model/database/game';
import { GameUser, gameUserSchema } from './model/database/game-user';
import { Message, messageSchema } from './model/database/message';
import { Question, questionSchema } from './model/database/question';
import { Quiz, quizSchema } from './model/database/quiz';
import { UserModule } from './modules/user/user.module';
import { GameService } from './services/game/game.service';
import { QuestionService } from './services/question/question.service';
import { QuizService } from './services/quiz/quiz.service';
import { TimerService } from './services/timer/timer.service';

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
        MongooseModule.forFeature([{ name: Game.name, schema: gameSchema }]),
        MongooseModule.forFeature([{ name: GameUser.name, schema: gameUserSchema }]),
        MongooseModule.forFeature([{ name: Message.name, schema: messageSchema }]),
        UserModule,
    ],
    controllers: [QuizController, QuestionController, GameController],
    providers: [QuizService, QuestionService, Logger, AuthentificationMiddleware, GameService, GameGateway, TimerService],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(cookieParser(process.env.COOKIE_SECRET)).forRoutes('*');
        consumer.apply(AuthentificationMiddleware).forRoutes('*');
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
