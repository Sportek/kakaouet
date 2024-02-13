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
    hasId: string;
    questionsQuiz: Question[] = [];
    quizVisibility: boolean;
    quizUpdate: Date;
    quizCreated: Date;

    // eslint-disable-next-line max-params
    constructor(
        private quizService: QuizService,
        // private questionService: QuestionService,
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
            // Cette ligne est optionnelle, elle force la mise à jour de la vue si nécessaire
            this.questionsQuiz = [...this.questionsQuiz];
        }
    }

    moveDown(index: number): void {
        if (index < this.questionsQuiz.length - 1) {
            const temp = this.questionsQuiz[index];
            this.questionsQuiz[index] = this.questionsQuiz[index + 1];
            this.questionsQuiz[index + 1] = temp;
            // Cette ligne est optionnelle, elle force la mise à jour de la vue si nécessaire
            this.questionsQuiz = [...this.questionsQuiz];
        }
    }

    modifyQuestion(id: string): void {
        this.questionService.sendId(id);
    }

    handleQuestionsImported(importedQuestions: Question[]): void {
        const newQuestions = importedQuestions.filter(
            // eslint-disable-next-line no-underscore-dangle
            (iq) => !this.questionsQuiz.some((q) => q._id === iq._id),
        );
        // eslint-disable-next-line no-underscore-dangle
        this.questionsQuiz = [...this.questionsQuiz, ...newQuestions].sort((a, b) => a._id.localeCompare(b._id));
        this.showImportOverlay = false;
    }

    getQuiz(id: string): void {
        this.quizService.getQuizById(id).subscribe({
            next: (quiz) => {
                this.titleQuiz = quiz.name;
                this.durationQuiz = quiz.duration;
                this.descriptionQuiz = quiz.description;
                // eslint-disable-next-line no-underscore-dangle
                this.hasId = quiz._id;
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
        // eslint-disable-next-line no-underscore-dangle
        this.quizService.updateQuizById(validatedQuiz._id, validatedQuiz).subscribe({});
    }

    removeQuestion(question: Question): void {
        const index: number = this.questionsQuiz.indexOf(question);
        this.questionsQuiz.splice(index, 1);
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
        if (this.hasId) {
            this.updateQuiz(this.quiz);
        } else {
            this.createQuiz();
        }
    }

    wordLength(): boolean {
        const word = this.titleQuiz.split(' ');
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < word.length; i++) {
            if (word[i].length > Variables.MaxWordLength) {
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
        // eslint-disable-next-line no-underscore-dangle
        const index = this.questionsQuiz.findIndex((question) => question._id === modifiedQuestion._id);
        if (index < 0) {
            this.questionsQuiz.push(modifiedQuestion);
        } else {
            this.questionsQuiz[index] = modifiedQuestion;
        }
    }
}
