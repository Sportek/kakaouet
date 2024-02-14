/* eslint-disable no-underscore-dangle */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { QuizQuestionOverlayComponent } from '@app/components/quiz-question-overlay/quiz-question-overlay.component';
import { QuestionService } from '@app/services/quiz/question.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { QuizValidation, ValidateService } from '@app/services/validate/validate.service';
import { Variables } from '@common/enum-variables';
import { Question, Quiz } from '@common/types';

@Component({
    selector: 'app-create-update-quiz',
    templateUrl: './create-update-quiz.component.html',
    styleUrls: ['./create-update-quiz.component.scss'],
})
export class CreateUpdateQuizComponent implements OnInit {
    @ViewChild(QuizQuestionOverlayComponent) quizQuestionOverlayComponent!: QuizQuestionOverlayComponent;

    showImportOverlay = false;

    quiz: Quiz;
    titleQuiz: string = '';
    durationQuiz: number;
    descriptionQuiz: string = '';
    quizId: string;
    questionsQuiz: Question[] = [];
    quizVisibility: boolean;
    quizUpdate: Date;
    quizCreated: Date;

    // eslint-disable-next-line max-params
    constructor(
        private quizService: QuizService,
        private route: ActivatedRoute,
        private questionService: QuestionService,
        private validateService: ValidateService,
        private dialog: MatSnackBar,
    ) {}

    ngOnInit() {
        const routeParams = this.route.snapshot.paramMap;
        const gameIdFromRoute = routeParams.get('id');
        if (gameIdFromRoute) {
            this.getQuiz(gameIdFromRoute);
        }
    }
    openImportOverlay(): void {
        this.showImportOverlay = true;
    }

    closeImportOverlay(): void {
        this.showImportOverlay = false;
    }

    moveUp(index: number): void {
        if (index > 0) {
            const temp = this.questionsQuiz[index];
            this.questionsQuiz[index] = this.questionsQuiz[index - 1];
            this.questionsQuiz[index - 1] = temp;
            this.questionsQuiz = [...this.questionsQuiz];
        }
    }

    moveDown(index: number): void {
        if (index < this.questionsQuiz.length - 1) {
            const temp = this.questionsQuiz[index];
            this.questionsQuiz[index] = this.questionsQuiz[index + 1];
            this.questionsQuiz[index + 1] = temp;
            this.questionsQuiz = [...this.questionsQuiz];
        }
    }

    modifyQuestion(id: string): void {
        this.questionService.sendId(id);
    }

    handleQuestionsImported(importedQuestions: Question[]): void {
        const newQuestions = importedQuestions.filter((iq) => !this.questionsQuiz.some((q) => q._id === iq._id));
        this.questionsQuiz = [...this.questionsQuiz, ...newQuestions].sort((a, b) => a._id.localeCompare(b._id));
        this.showImportOverlay = false;
    }

    getQuiz(id: string): void {
        this.quizService.getQuizById(id).subscribe({
            next: (quiz) => {
                this.titleQuiz = quiz.name;
                this.durationQuiz = quiz.duration;
                this.descriptionQuiz = quiz.description;
                this.quizId = quiz._id;
                this.questionsQuiz = quiz.questions;
                this.quizVisibility = quiz.visibility;
                this.quizUpdate = quiz.updatedAt;
                this.quizCreated = quiz.createdAt;
                this.quiz = quiz;
                this.quizService.specifyAmountOfQuizzes(this.questionsQuiz.length);
            },
        });
    }

    updateQuiz(updatedQuiz: Quiz): void {
        updatedQuiz.name = this.titleQuiz;
        updatedQuiz.description = this.descriptionQuiz;
        updatedQuiz.duration = this.durationQuiz;
        updatedQuiz.visibility = false;
        updatedQuiz.questions = this.questionsQuiz;
        updatedQuiz.updatedAt = new Date();
        updatedQuiz.visibility = this.quizVisibility;
        const validatedQuiz = this.validateService.validateQuiz(updatedQuiz).object;
        this.quizService.updateQuizById(validatedQuiz._id, validatedQuiz).subscribe({});
    }

    removeQuestion(question: Question): void {
        const index: number = this.questionsQuiz.indexOf(question);
        if (index >= 0) this.questionsQuiz.splice(index, 1);
    }

    createQuiz(): void {
        const newQuiz: Partial<Quiz> = {
            name: this.titleQuiz,
            description: this.descriptionQuiz,
            duration: this.durationQuiz,
            visibility: false,
            questions: this.questionsQuiz,
        };
        this.quizService.addNewQuiz(newQuiz as Quiz).subscribe({});
    }

    importQuestionToBank(question: Question): void {
        const partialQuestionNoId: Partial<Question> = {
            label: question.label,
            points: question.points,
            createdAt: question.createdAt,
            updatedAt: question.updatedAt,
            type: question.type,
        };
        if (partialQuestionNoId.type === 'QCM' && question.type === 'QCM') partialQuestionNoId.choices = question.choices;
        this.questionService.getQuestions().subscribe((questionsFromBank: Question[]) => {
            const questionExistsInBank = questionsFromBank.some((q: Question) => q.label === partialQuestionNoId.label);
            if (!questionExistsInBank) {
                this.questionService.createQuestion(partialQuestionNoId as Question).subscribe({});
                this.dialog.open('La question a bien était importé à la banque de question', 'Fermer', {
                    duration: 3000,
                });
            } else {
                this.dialog.open('La question existe deja dans la banque de question', 'Fermer', {
                    duration: 3000,
                });
            }
        });
    }

    onSubmit() {
        if (this.quizId) {
            this.quizService.getQuizById(this.quizId).subscribe({
                next: (quiz) => {
                    this.updateQuiz(quiz);
                },
                error: () => {
                    this.createQuiz();
                },
            });
        } else {
            this.createQuiz();
        }
    }

    wordLength(): boolean {
        const words: string[] = this.titleQuiz.split(' ');
        for (const word of words) {
            if (word.length > Variables.MaxWordLength) {
                return false;
            }
        }
        return true;
    }

    isError(): string | null {
        if (!QuizValidation.checkRequiredName.callback({ name: this.titleQuiz })) {
            return QuizValidation.checkRequiredName.errorMessage;
        }

        if (!QuizValidation.checkMaxTitleLength.callback({ name: this.titleQuiz })) {
            return QuizValidation.checkMaxTitleLength.errorMessage;
        }

        if (!QuizValidation.checkMaxWordLength.callback({ name: this.titleQuiz })) {
            return QuizValidation.checkMaxWordLength.errorMessage;
        }

        if (!QuizValidation.checkMinResponseTime.callback({ duration: this.durationQuiz })) {
            return QuizValidation.checkMinResponseTime.errorMessage;
        }

        if (!QuizValidation.checkMaxResponseTime.callback({ duration: this.durationQuiz })) {
            return QuizValidation.checkMaxResponseTime.errorMessage;
        }

        if (!QuizValidation.checkMinDescriptionLength.callback({ description: this.descriptionQuiz })) {
            return QuizValidation.checkMinDescriptionLength.errorMessage;
        }

        if (!QuizValidation.checkMaxDescriptionLength.callback({ description: this.descriptionQuiz })) {
            return QuizValidation.checkMaxDescriptionLength.errorMessage;
        }

        if (!QuizValidation.checkRequiredQuestions.callback({ questions: this.questionsQuiz })) {
            return QuizValidation.checkRequiredQuestions.errorMessage;
        }
        return null;
    }

    onQuestionListUpdate(modifiedQuestion: Question) {
        const index = this.questionsQuiz.findIndex((question) => question._id === modifiedQuestion._id);
        if (index < 0) {
            this.questionsQuiz.push(modifiedQuestion);
        } else {
            this.questionsQuiz[index] = modifiedQuestion;
        }
    }
}
