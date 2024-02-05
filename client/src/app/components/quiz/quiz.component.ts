import { Component, OnInit } from '@angular/core';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Quiz } from '@common/types';

@Component({
    selector: 'app-quiz',
    templateUrl: './quiz.component.html',
    styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent implements OnInit {
    quizList: Quiz[];

    constructor(private quizService: QuizService) {}

    ngOnInit() {
        this.quizService.getAllQuizzes().subscribe({
            next: (quizzes) => {
                this.quizList = quizzes;
            },
        });
    }

    changeVisibility(quiz: Quiz): void {
        quiz.visibility = !quiz.visibility;
    }

    removeQuiz(quiz: Quiz): void {
        const index: number = this.quizList.indexOf(quiz);
        this.quizList.splice(index, 1);
        // MongoDB renvoie _id donc on traite _id, le prof accepte cette solution
        // eslint-disable-next-line no-underscore-dangle
        this.quizService.deleteQuizById(quiz._id);
    }
}
