import { QuizDto } from '@app/model/dto/quiz/quiz.dto';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Quizzes')
@Controller('quiz')
export class QuizController {
    constructor(private readonly quizService: QuizService) {}

    @Get('/')
    async getAllQuizzes() {
        return this.quizService.getAllQuizzes();
    }

    @Get('/:id')
    async getQuizById(@Param('id') id: string, @Query('index') index?: number) {
        const quiz = await this.quizService.getQuizById(id);

        if (!quiz) {
            throw new HttpException('Quiz not found', HttpStatus.NOT_FOUND);
        }
        if (index !== undefined) {
            const question = quiz.questions[index];

            if (!question) {
                throw new HttpException('Question not found', HttpStatus.NOT_FOUND);
            }

            const CHOICE_NOT_FOUND = -1;

            const correctChoicesIndices = question.choices
                .map((choice, choiceIndex) => (choice.isCorrect ? choiceIndex : CHOICE_NOT_FOUND))
                .filter((position) => position !== CHOICE_NOT_FOUND);

            return correctChoicesIndices;
        } else {
            return quiz;
        }
    }

    @Post('/')
    @HttpCode(HttpStatus.CREATED)
    async createQuiz(@Body() quiz: QuizDto) {
        if (!(await this.quizService.doesQuizExist(quiz.title))) {
            return this.quizService.addNewQuiz(quiz);
        } else {
            throw new HttpException('Quiz name has to be unique: ', HttpStatus.BAD_REQUEST);
        }
    }

    @Patch('/:id')
    @HttpCode(HttpStatus.OK)
    async updateQuiz(@Param('id') id: string, @Body() quiz: QuizDto) {
        return this.quizService.updateQuizById(id, quiz);
    }

    @Delete('/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteQuiz(@Param('id') id: string) {
        return this.quizService.deleteQuizById(id);
    }

    @Post('/validate/:quizId/:questionId')
    @HttpCode(HttpStatus.OK)
    async validateAnswers(@Param('quizId') quizId: string, @Param('questionId') questionId: number, @Body() body: { answers: number[] }) {
        const feedback = await this.quizService.validateAnswers(quizId, questionId, body.answers);
        if (feedback) return feedback;
        throw new HttpException('Impossible to find answers matching quizId and questionId', HttpStatus.BAD_REQUEST);
    }
}
