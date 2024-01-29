import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

const fakeGame = {
    title: 'Quiz de test',
    description: 'Quiz de test',
    time: 10,
    questions: [
        {
            title: 'Question 1',
            description: 'Question 1',
            answers: [
                {
                    title: 'Réponse 1',
                    description: 'Réponse 1',
                    isCorrect: true,
                },
                {
                    title: 'Réponse 2',
                    description: 'Réponse 2',
                    isCorrect: false,
                },
                {
                    title: 'Réponse 3',
                    description: 'Réponse 3',
                    isCorrect: false,
                },
                {
                    title: 'Réponse 4',
                    description: 'Réponse 4',
                    isCorrect: false,
                },
            ],
        },
        {
            title: 'Question 2',
            description: 'Question 2',
            answers: [
                {
                    title: 'Réponse 1',
                    description: 'Réponse 1',
                    isCorrect: true,
                },
                {
                    title: 'Réponse 2',
                    description: 'Réponse 2',
                    isCorrect: false,
                },
                {
                    title: 'Réponse 3',
                    description: 'Réponse 3',
                    isCorrect: false,
                },
                {
                    title: 'Réponse 4',
                    description: 'Réponse 4',
                    isCorrect: false,
                },
            ],
        },
    ],
};

@Component({
    selector: 'app-create-update-quiz',
    templateUrl: './create-update-quiz.component.html',
    styleUrls: ['./create-update-quiz.component.scss'],
})
export class CreateUpdateQuizComponent implements OnInit {
    title: string;
    description: string;
    time: number;
    hasId: boolean = false;

    constructor(private route: ActivatedRoute) {}

    ngOnInit() {
        this.route.paramMap.subscribe((param) => {
            this.hasId = param.get('id') != null;
            if (this.hasId) {
                this.title = fakeGame.title;
                this.description = fakeGame.description;
                this.time = fakeGame.time;
            }
        });
    }
}
