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
        this.getListQuestions();
        this.quizService.getQuizUpdates().subscribe(() => this.getListQuestions());
    }

    getListQuestions() {
        this.quizService.getAllQuizzes().subscribe({
            next: (quizzes) => {
                this.quizList = quizzes;
            },
        });
    }

    changeVisibility(quiz: Quiz): void {
        quiz.visibility = !quiz.visibility;
        // eslint-disable-next-line no-underscore-dangle
        this.quizService.updateQuizById(quiz._id, quiz).subscribe({});
    }

    removeQuiz(quiz: Quiz): void {
        const index: number = this.quizList.indexOf(quiz);
        // eslint-disable-next-line no-underscore-dangle
        this.quizService.deleteQuizById(this.quizList[index]._id).subscribe({});
        this.quizList.splice(index, 1);
    }

    generateQuizAsFile(quiz: Quiz) {
        const fileContent = JSON.stringify(quiz);
        const blob = new Blob([fileContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = quiz.name + '.json';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
