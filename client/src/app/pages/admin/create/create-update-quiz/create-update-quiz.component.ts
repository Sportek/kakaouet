import { /* ChangeDetectorRef,*/ Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Question, Quiz } from '@common/types';
// eslint-disable-next-line no-restricted-imports
import { Variables } from '../enum-variables';

@Component({
    selector: 'app-create-update-quiz',
    templateUrl: './create-update-quiz.component.html',
    styleUrls: ['./create-update-quiz.component.scss'],
})
export class CreateUpdateQuizComponent implements OnInit {
    minTime: number = Variables.MinTime;
    maxTime: number = Variables.MaxTime;
    minScore: number = Variables.MinScore;
    maxScore: number = Variables.MaxScore;

    quiz: Quiz;
    titleQuiz: string;
    durationQuiz: number;
    descriptionQuiz: string;
    hasId: string;
    questionsQuiz: Question[];
    quizVisibility: boolean;

    constructor(
        // private cdr: ChangeDetectorRef,
        private quizService: QuizService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        const routeParams = this.route.snapshot.paramMap;
        const gameIdFromRoute = routeParams.get('id');
        if (gameIdFromRoute) {
            this.getQuiz(gameIdFromRoute);
        }
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
                this.quiz = quiz;
            },
        });
    }

    updateQuiz(quiz: Quiz): void {
        this.quiz.name = this.titleQuiz;
        this.quiz.description = this.descriptionQuiz;
        this.quiz.duration = this.durationQuiz;
        this.quiz.visibility = false;
        this.quiz.questions = this.questionsQuiz;
        this.quiz.updatedAt = new Date();
        this.quiz.visibility = this.quizVisibility;
        // eslint-disable-next-line no-underscore-dangle
        this.quizService.updateQuizById(quiz._id, quiz).subscribe({});
    }

    /* createQuiz(quiz: Quiz): void {
        this.quiz.name = this.titleQuiz;
        this.quiz.description = this.descriptionQuiz;
        this.quiz.duration = this.durationQuiz;
        this.quiz.visibility = false;
        this.quiz.questions = this.questionsQuiz;
        this.quiz.updatedAt = new Date();
        this.quiz.createdAt = new Date();
        this.quiz.visibility = this.quizVisibility;
        this.cdr.detectChanges();
        this.quizService.addNewQuiz(quiz).subscribe({});
    }*/

    onSubmit() {
        if (this.hasId) {
            this.updateQuiz(this.quiz);
        }
        /* else {
            // eslint-disable-next-line no-console
            console.log(this.quiz);
            this.createQuiz(this.quiz);
        }*/
    }

    /* addOverlay(): void {
        this.overlayStatus.display = 'flex';
    }

    removeOverlay(): void {
        this.overlayStatus.display = 'none';
    }

    overlayStatus = {
        display: 'off',
    }; */
}
