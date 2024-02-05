import { Question } from '@app/model/database/question';
import { QuestionService } from '@app/services/question/question.service';
import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
@ApiTags('Questions')
@Controller('question')
export class QuestionController {
    constructor(private readonly questionService: QuestionService) {}

    @Get('/')
    async getAllQuestions() {
        return await this.questionService.getAllQuestions();
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
    async createQuestion(@Body() question: Question) {
        if (await this.questionService.validateQuestionObject(question)) {
            await this.questionService.addNewQuestion(question);
            return 'Question created successfully';
        } else {
            throw new HttpException('Invalid question object', HttpStatus.BAD_REQUEST);
        }
    }

    @Patch('/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async updateQuestion(@Param('id') id: string, @Body() question: Question) {
        if (await this.questionService.validateQuestionObject(question)) {
            await this.questionService.updateQuestionById(id, question);
            return 'Question updated successfully';
        } else {
            throw new HttpException('Invalid question object', HttpStatus.BAD_REQUEST);
        }
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
