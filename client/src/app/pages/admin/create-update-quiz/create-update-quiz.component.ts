/* eslint-disable no-underscore-dangle */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuestionOverlayComponent } from '@app/components/question-overlay/question-overlay.component';
import { OverlayService } from '@app/services/overlay/overlay.service';
import { QuestionService } from '@app/services/quiz/question.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Question, Quiz } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-create-update-quiz',
    templateUrl: './create-update-quiz.component.html',
    styleUrls: ['./create-update-quiz.component.scss'],
})
export class CreateUpdateQuizComponent implements OnInit, OnDestroy {
    @ViewChild(QuestionOverlayComponent) questionOverlayComponent!: QuestionOverlayComponent;

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

    private subscriber: Subscription;

    // eslint-disable-next-line max-params
    constructor(
        private quizService: QuizService,
        private route: ActivatedRoute,
        private questionService: QuestionService,
        private overlayService: OverlayService,
    ) {}

    ngOnInit() {
        const routeParams = this.route.snapshot.paramMap;
        const gameIdFromRoute = routeParams.get('id');
        if (gameIdFromRoute) {
            this.getQuiz(gameIdFromRoute);
        }
        this.overlayService.specifyQuiz(this.quiz);
    }

    ngOnDestroy(): void {
        if (this.subscriber) {
            this.subscriber.unsubscribe();
        }
    }

    openImportOverlay(): void {
        this.showImportOverlay = true;
    }

    closeImportOverlay(): void {
        this.showImportOverlay = false;
    }

    moveQuestionUp(index: number): void {
        this.questionService.moveQuestionUp(index, this.quiz);
    }

    moveQuestionDown(index: number): void {
        this.questionService.moveQuestionDown(index, this.quiz);
    }

    removeQuestion(question: Question): void {
        this.questionService.removeQuestion(question, this.quiz);
    }

    handleQuestionsImported(importedQuestions: Question[]): void {
        this.questionService.handleQuestionsImported(importedQuestions, this.quiz);
        this.showImportOverlay = false;
    }

    getQuiz(id: string) {
        this.quizService.getQuiz(id, this.quiz);
    }

    updateQuiz(updatedQuiz: Quiz): void {
        this.quizService.updateQuiz(updatedQuiz, this.quiz);
    }

    createQuiz(): void {
        this.quizService.createQuiz(this.quiz);
    }

    importQuestionToBank(question: Question): void {
        this.questionService.importQuestionToBank(question);
    }

    onSubmit() {
        if (this.quiz._id) {
            this.subscriber = this.quizService.getQuizById(this.quiz._id).subscribe({
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

    hasError(): string | null {
        return this.quizService.hasError(this.quiz);
    }
}
