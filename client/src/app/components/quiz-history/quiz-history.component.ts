import { Component } from '@angular/core';

@Component({
    selector: 'app-quiz-termine',
    templateUrl: './quiz-history.component.html',
    styleUrls: ['./quiz-history.component.scss'],
})
export class QuizHistoryComponent /* implements OnInit*/ {
    // quiz1: Quiz = {
    //     _id: '1a2b3c',
    //     name: 'Questionnaire sur HTML',
    //     description: 'Questions de pratique sur le langage JavaScript',
    //     duration: 60,
    //     visibility: true,
    //     questions: [
    //         {
    //             type: QuestionType.QCM,
    //             _id: 'q01',
    //             text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
    //             points: 40,
    //             choices: [
    //                 {
    //                     text: 'var',
    //                     isCorrect: true,
    //                 },
    //                 {
    //                     text: 'self',
    //                     isCorrect: false,
    //                 },
    //                 {
    //                     text: 'this',
    //                     isCorrect: true,
    //                 },
    //                 {
    //                     text: 'int',
    //                     isCorrect: true,
    //                 },
    //             ],
    //             createdAt: new Date('2018-11-16T20:20:39+00:00'),
    //             updatedAt: new Date('2018-11-17T02:00:11+00:00'),
    //         },
    //         {
    //             type: QuestionType.QRL,
    //             _id: 'q02',
    //             text: "Donnez la différence entre 'let' et 'var' pour la déclaration d'une variable en JS ?",
    //             points: 60,
    //             createdAt: new Date('2018-11-11T19:43:52+00:00'),
    //             updatedAt: new Date('2018-11-13T10:10:10+00:00'),
    //         },
    //         {
    //             type: QuestionType.QCM,
    //             _id: 'q03',
    //             text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
    //             points: 20,
    //             choices: [
    //                 {
    //                     text: 'Non',
    //                     isCorrect: true,
    //                 },
    //                 {
    //                     text: 'Oui',
    //                     isCorrect: false,
    //                 },
    //             ],
    //             createdAt: new Date('2018-11-15T14:22:54+00:00'),
    //             updatedAt: new Date('2018-11-18T07:10:16+00:00'),
    //         },
    //     ],
    //     createdAt: new Date('2018-11-13T20:20:39+00:00'),
    //     updatedAt: new Date('2018-11-13T20:20:39+00:00'),
    // };
    // quiz2: Quiz = {
    //     _id: '1a2b3c',
    //     name: 'Questionnaire sur le JS',
    //     description: 'Questions de pratique sur le langage JavaScript',
    //     duration: 60,
    //     visibility: false,
    //     questions: [
    //         {
    //             type: QuestionType.QCM,
    //             _id: 'q01',
    //             text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
    //             points: 40,
    //             choices: [
    //                 {
    //                     text: 'var',
    //                     isCorrect: true,
    //                 },
    //                 {
    //                     text: 'self',
    //                     isCorrect: false,
    //                 },
    //                 {
    //                     text: 'this',
    //                     isCorrect: true,
    //                 },
    //                 {
    //                     text: 'int',
    //                     isCorrect: true,
    //                 },
    //             ],
    //             createdAt: new Date('2018-11-16T20:20:39+00:00'),
    //             updatedAt: new Date('2018-11-17T02:00:11+00:00'),
    //         },
    //         {
    //             type: QuestionType.QRL,
    //             _id: 'q02',
    //             text: "Donnez la différence entre 'let' et 'var' pour la déclaration d'une variable en JS ?",
    //             points: 60,
    //             createdAt: new Date('2018-11-11T19:43:52+00:00'),
    //             updatedAt: new Date('2018-11-13T10:10:10+00:00'),
    //         },
    //         {
    //             type: QuestionType.QCM,
    //             _id: 'q03',
    //             text: "Est-ce qu'on le code suivant lance une erreur : const a = 1/NaN; ? ",
    //             points: 20,
    //             choices: [
    //                 {
    //                     text: 'Non',
    //                     isCorrect: true,
    //                 },
    //                 {
    //                     text: 'Oui',
    //                     isCorrect: false,
    //                 },
    //             ],
    //             createdAt: new Date('2018-11-15T14:22:54+00:00'),
    //             updatedAt: new Date('2018-11-18T07:10:16+00:00'),
    //         },
    //     ],
    //     createdAt: new Date('2018-11-13T20:20:39+00:00'),
    //     updatedAt: new Date('2018-11-15T20:20:39+00:00'),
    // };
    // user1: GameUser = {
    //     _id: 'k440si3',
    //     name: 'Ozone',
    //     score: 1220,
    //     isExcluded: false,
    //     isActive: false,
    //     answerState: AnswerState.Confirmed,
    //     role: GameRole.Player,
    // };
    // user2: GameUser = {
    //     _id: 'l9d19k',
    //     name: 'Sportek',
    //     score: 1315,
    //     isExcluded: false,
    //     isActive: false,
    //     answerState: AnswerState.Confirmed,
    //     role: GameRole.Player,
    // };
    // user3: GameUser = {
    //     _id: 'k440sj7',
    //     name: 'Ozone',
    //     score: 1590,
    //     isExcluded: false,
    //     isActive: false,
    //     answerState: AnswerState.Confirmed,
    //     role: GameRole.Player,
    // };
    // user4: GameUser = {
    //     _id: 'l9d10a',
    //     name: 'Sportek',
    //     score: 1645,
    //     isExcluded: false,
    //     isActive: false,
    //     answerState: AnswerState.Confirmed,
    //     role: GameRole.Player,
    // };
    // game1: Game = {
    //     _id: '1j45ttr',
    //     users: [this.user1, this.user2],
    //     quiz: this.quiz1,
    //     type: GameType.Default,
    //     isLocked: true,
    //     code: '9224',
    //     createdAt: new Date('2024-01-18T11:01:39+00:00'),
    //     updatedAt: new Date('2024-01-18T11:31:20+00:00'),
    //     messages: [],
    // };
    // game2: Game = {
    //     _id: 'b8anfo2',
    //     users: [this.user2, this.user3],
    //     quiz: this.quiz1,
    //     type: GameType.Default,
    //     isLocked: true,
    //     code: '9225',
    //     createdAt: new Date('2024-01-22T14:55:27+00:00'),
    //     updatedAt: new Date('2024-01-22T15:24:03+00:00'),
    //     messages: [],
    // };
    // game3: Game = {
    //     _id: 'av0s9g1',
    //     users: [this.user3, this.user4],
    //     quiz: this.quiz2,
    //     type: GameType.Default,
    //     isLocked: true,
    //     code: '9226',
    //     createdAt: new Date('2024-01-18T15:44:31+00:00'),
    //     updatedAt: new Date('2024-01-18T16:19:55+00:00'),
    //     messages: [],
    // };
    // gameList: Game[] = [];
    // maxScore(game: Game): number {
    //     return game.users.reduce((accumulator, curValue) => Math.max(accumulator, curValue.score), 0);
    // }
    // ngOnInit(): void {
    //     this.gameList.push(this.game1);
    //     this.gameList.push(this.game2);
    //     this.gameList.push(this.game3);
    // }
}
