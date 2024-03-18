import { QuestionDto } from '@app/model/dto/question/question.dto';
import { QuestionService } from '@app/services/question/question.service';
import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Questions')
@Controller('question')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @Get('/')
    async getAllQuestions() {
        return this.questionService.getAllQuestions();
    }

    @Get('/:id')
    async getQuestionById(@Param('id') id: string) {
        const question = await this.questionService.getQuestionById(id);
        if (question) {
            return question;
        } else {
            throw new HttpException('Not Found', HttpStatus.NOT_FOUND);
        }
    }

    @Post('/')
    @HttpCode(HttpStatus.CREATED)
    async createQuestion(@Body() question: QuestionDto) {
        return this.questionService.addNewQuestion(question);
    }

    @Patch('/:id')
    @HttpCode(HttpStatus.OK)
    async updateQuestion(@Param('id') id: string, @Body() question: QuestionDto) {
        return this.questionService.updateQuestionById(id, question);
    }

    @Delete('/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteQuestion(@Param('id') id: string) {
        await this.questionService.deleteQuestionById(id);
    }

    @Delete('/')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteAllQuestions() {
        await this.questionService.deleteAllQuestions();
    }
}
