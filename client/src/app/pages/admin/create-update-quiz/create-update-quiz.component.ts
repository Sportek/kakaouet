/* eslint-disable no-underscore-dangle */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { QuizQuestionOverlayComponent } from '@app/components/quiz-question-overlay/quiz-question-overlay.component';
import { QuestionService } from '@app/services/quiz/question.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { QuizValidation, ValidateService } from '@app/services/validate/validate.service';
import { Question, Quiz } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-create-update-quiz',
    templateUrl: './create-update-quiz.component.html',
    styleUrls: ['./create-update-quiz.component.scss'],
})
export class CreateUpdateQuizComponent implements OnInit, OnDestroy {
    @ViewChild(QuizQuestionOverlayComponent) quizQuestionOverlayComponent!: QuizQuestionOverlayComponent;

    quiz: Quiz = {
        name: '',
        description: '',
        duration: 0,
        visibility: false,
        questions: [],
        _id: '',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    showImportOverlay = false;
    private quizSubscription: Subscription | undefined;
    private questionSubscription: Subscription | undefined;

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

    ngOnDestroy() {
        if (this.quizSubscription) {
            this.quizSubscription.unsubscribe();
        }
        if (this.questionSubscription) {
            this.questionSubscription.unsubscribe();
        }
    }

    openImportOverlay(): void {
        this.showImportOverlay = true;
    }

    closeImportOverlay(): void {
        this.showImportOverlay = false;
    }

    moveUp(index: number): void {
        this.questionService.moveUp(index, this.quiz);
    }

    moveDown(index: number): void {
        this.questionService.moveDown(index, this.quiz);
    }

    modifyQuestion(id: string): void {
        this.questionService.sendId(id);
    }

    handleQuestionsImported(importedQuestions: Question[]): void {
        const newQuestions = importedQuestions.filter(
            (importedQuestion) => !this.quiz.questions.some((existingQuestion) => existingQuestion._id === importedQuestion._id),
        );
        this.quiz.questions = [...this.quiz.questions, ...newQuestions].sort((questionA, questionB) => questionA._id.localeCompare(questionB._id));
        this.showImportOverlay = false;
    }

    getQuiz(id: string): void {
        this.quizSubscription = this.quizService.getQuizById(id).subscribe({
            next: (quizToGet) => {
                this.quiz.name = quizToGet.name;
                this.quiz.duration = quizToGet.duration;
                this.quiz.description = quizToGet.description;
                this.quiz._id = quizToGet._id;
                this.quiz.questions = quizToGet.questions;
                this.quiz.visibility = quizToGet.visibility;
                this.quiz.updatedAt = quizToGet.updatedAt;
                this.quiz.createdAt = quizToGet.createdAt;
                this.quiz = quizToGet;
                this.quizService.specifyAmountOfQuizzes(this.quiz.questions.length);
            },
        });
    }

    updateQuiz(updatedQuiz: Quiz): void {
        updatedQuiz.name = this.quiz.name;
        updatedQuiz.description = this.quiz.description;
        updatedQuiz.duration = this.quiz.duration;
        updatedQuiz.visibility = false;
        updatedQuiz.questions = this.quiz.questions;
        updatedQuiz.updatedAt = new Date();
        updatedQuiz.visibility = this.quiz.visibility;
        const validatedQuiz = this.validateService.validateQuiz(updatedQuiz).object;
        this.quizSubscription = this.quizService.updateQuizById(validatedQuiz._id, validatedQuiz).subscribe({});
    }

    removeQuestion(question: Question): void {
        this.questionService.removeQuestion(question, this.quiz);
    }

    createQuiz(): void {
        const newQuiz: Partial<Quiz> = {
            name: this.quiz.name,
            description: this.quiz.description,
            duration: this.quiz.duration,
            visibility: false,
            questions: this.quiz.questions,
        };
        this.quizSubscription = this.quizService.addNewQuiz(newQuiz as Quiz).subscribe({});
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
        this.questionSubscription = this.questionService.getQuestions().subscribe((questionsFromBank: Question[]) => {
            const questionExistsInBank = questionsFromBank.some((existingQuestion: Question) => existingQuestion.label === partialQuestionNoId.label);
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
        if (this.quiz._id) {
            this.quizService.getQuizById(this.quiz._id).subscribe({
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

    isError(): string | null {
        if (!QuizValidation.checkRequiredName.callback({ name: this.quiz.name })) {
            return QuizValidation.checkRequiredName.errorMessage;
        }

        if (!QuizValidation.checkMaxTitleLength.callback({ name: this.quiz.name })) {
            return QuizValidation.checkMaxTitleLength.errorMessage;
        }

        if (!QuizValidation.checkMaxWordLength.callback({ name: this.quiz.name })) {
            return QuizValidation.checkMaxWordLength.errorMessage;
        }

        if (!QuizValidation.checkMinResponseTime.callback({ duration: this.quiz.duration })) {
            return QuizValidation.checkMinResponseTime.errorMessage;
        }

        if (!QuizValidation.checkMaxResponseTime.callback({ duration: this.quiz.duration })) {
            return QuizValidation.checkMaxResponseTime.errorMessage;
        }

        if (!QuizValidation.checkMinDescriptionLength.callback({ description: this.quiz.description })) {
            return QuizValidation.checkMinDescriptionLength.errorMessage;
        }

        if (!QuizValidation.checkMaxDescriptionLength.callback({ description: this.quiz.description })) {
            return QuizValidation.checkMaxDescriptionLength.errorMessage;
        }

        if (!QuizValidation.checkRequiredQuestions.callback({ questions: this.quiz.questions })) {
            return QuizValidation.checkRequiredQuestions.errorMessage;
        }
        return null;
    }

    onQuestionListUpdate(modifiedQuestion: Question) {
        const index = this.quiz.questions.findIndex((question) => question._id === modifiedQuestion._id);
        if (index < 0) {
            this.quiz.questions.push(modifiedQuestion);
        } else {
            this.quiz.questions[index] = modifiedQuestion;
        }
    }
}
