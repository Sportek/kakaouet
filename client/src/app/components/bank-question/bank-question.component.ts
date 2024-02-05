import { Component, OnInit } from '@angular/core';
import { Question, QuestionType } from '@common/types';

@Component({
    selector: 'app-bank-question',
    templateUrl: './bank-question.component.html',
    styleUrls: ['./bank-question.component.scss'],
})
export class BankQuestionComponent implements OnInit {
    question1: Question = {
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
    };
    question2: Question = {
        type: QuestionType.QRL,
        _id: 'q02',
        label: "Donnez la différence entre 'let' et 'var' pour la déclaration d'une variable en JS ?",
        points: 60,
        createdAt: new Date('2018-11-11T19:43:52+00:00'),
        updatedAt: new Date('2018-11-13T10:10:10+00:00'),
    };
    question3: Question = {
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
    };

    questionList: Question[] = [];

    ngOnInit(): void {
        this.questionList.push(this.question1);
        this.questionList.push(this.question2);
        this.questionList.push(this.question3);
    }
}
