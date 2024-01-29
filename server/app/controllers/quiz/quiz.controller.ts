import { Quiz } from '@app/model/database/quiz';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Quizzes')
@Controller('quiz')
export class QuizController {
    constructor(private readonly quizService: QuizService) {}

    @Get('/')
    async getAllQuizzes() {
        return await this.quizService.getAllQuizzes();
    }

    @Get('/:id')
    async getQuizById(@Param('id') id: string) {
        const quiz = await this.quizService.getQuizById(id);
        if (!quiz) {
            throw new HttpException('Quiz not found', HttpStatus.NOT_FOUND);
        }
        return quiz;
    }

    @Post('/')
    @HttpCode(HttpStatus.CREATED)
    async createQuiz(@Body() quiz: Quiz) {
        return await this.quizService.addNewQuiz(quiz);
    }

    @Patch('/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateQuiz(@Param('id') id: string, @Body() quiz: Quiz) {
        return await this.quizService.updateQuizById(id, quiz);
    }

    @Delete('/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteQuiz(@Param('id') id: string) {
        return await this.quizService.deleteQuizById(id);
    }
}
