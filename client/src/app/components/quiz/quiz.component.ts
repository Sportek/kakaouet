import { Component, OnInit } from '@angular/core';
import { QuestionType, Quiz } from '@common/types';

@Component({
    selector: 'app-quiz',
    templateUrl: './quiz.component.html',
    styleUrls: ['./quiz.component.scss'],
})
export class QuizComponent implements OnInit {
    quiz1: Quiz = {
        _id: '1a2b3c',
        name: 'Questionnaire sur HTML',
        description: 'Questions de pratique sur le langage JavaScript',
        duration: 60,
        visibility: true,
        questions: [
            {
                type: QuestionType.QCM,
                _id: 'q01',
                label: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
                points: 40,
                choices: [
                    {
                        _id: 1,
                        label: 'var',
                        isCorrect: true,
                    },
                    {
                        _id: 2,
                        label: 'self',
                        isCorrect: false,
                    },
                    {
                        _id: 3,
                        label: 'this',
                        isCorrect: true,
                    },
                    {
                        _id: 4,
                        label: 'int',
                        isCorrect: true,
                    },
                ],
                createdAt: new Date('2018-11-16T20:20:39+00:00'),
                updatedAt: new Date('2018-11-17T02:00:11+00:00'),
            },
            {
                type: QuestionType.QRL,
                _id: 'q02',
                label: "Donnez la différence entre 'let' et 'var' pour la déclaration d'une variable en JS ?",
                points: 60,
                createdAt: new Date('2018-11-11T19:43:52+00:00'),
                updatedAt: new Date('2018-11-13T10:10:10+00:00'),
            },
            {
                type: QuestionType.QCM,
                _id: 'q03',
                label: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
                points: 20,
                choices: [
                    {
                        _id: 1,
                        label: 'Non',
                        isCorrect: true,
                    },
                    {
                        _id: 2,
                        label: 'Oui',
                        isCorrect: false,
                    },
                ],
                createdAt: new Date('2018-11-15T14:22:54+00:00'),
                updatedAt: new Date('2018-11-18T07:10:16+00:00'),
            },
        ],
        createdAt: new Date('2018-11-13T20:20:39+00:00'),
        updatedAt: new Date('2018-11-13T20:20:39+00:00'),
    };

    quiz2: Quiz = {
        _id: '1a2b3c',
        name: 'Questionnaire sur le JS',
        description: 'Questions de pratique sur le langage JavaScript',
        duration: 60,
        visibility: false,
        questions: [
            {
                type: QuestionType.QCM,
                _id: 'q01',
                label: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
                points: 40,
                choices: [
                    {
                        _id: 1,
                        label: 'var',
                        isCorrect: true,
                    },
                    {
                        _id: 2,
                        label: 'self',
                        isCorrect: false,
                    },
                    {
                        _id: 3,
                        label: 'this',
                        isCorrect: true,
                    },
                    {
                        _id: 4,
                        label: 'int',
                        isCorrect: true,
                    },
                ],
                createdAt: new Date('2018-11-16T20:20:39+00:00'),
                updatedAt: new Date('2018-11-17T02:00:11+00:00'),
            },
            {
                type: QuestionType.QRL,
                _id: 'q02',
                label: "Donnez la différence entre 'let' et 'var' pour la déclaration d'une variable en JS ?",
                points: 60,
                createdAt: new Date('2018-11-11T19:43:52+00:00'),
                updatedAt: new Date('2018-11-13T10:10:10+00:00'),
            },
            {
                type: QuestionType.QCM,
                _id: 'q03',
                label: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
                points: 20,
                choices: [
                    {
                        _id: 1,
                        label: 'Non',
                        isCorrect: true,
                    },
                    {
                        _id: 2,
                        label: 'Oui',
                        isCorrect: false,
                    },
                ],
                createdAt: new Date('2018-11-15T14:22:54+00:00'),
                updatedAt: new Date('2018-11-18T07:10:16+00:00'),
            },
        ],
        createdAt: new Date('2018-11-13T20:20:39+00:00'),
        updatedAt: new Date('2018-11-15T20:20:39+00:00'),
    };
    quizList: Quiz[] = [];

    ngOnInit(): void {
        this.quizList.push(this.quiz1);
        this.quizList.push(this.quiz2);
    }

    changeVisibility(quiz: Quiz): void {
        quiz.visibility = !quiz.visibility;
    }

    removeQuiz(quiz: Quiz): void {
        const index: number = this.quizList.indexOf(quiz);
        this.quizList.splice(index, 1);
    }
}
