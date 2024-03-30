import { Injectable } from '@angular/core';
import { QuestionService } from '@app/services/quiz/question.service';
import { ValidateService } from '@app/services/validate/validate.service';
import { Choice, Question, QuestionType, Quiz } from '@common/types';
import { cloneDeep } from 'lodash';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class OverlayService {
    private baseChoices: Choice[] = [
        {
            _id: 1,
            text: 'Réponse A',
            isCorrect: true,
        },
        {
            _id: 2,
            text: 'Réponse B',
            isCorrect: false,
        },
        {
            _id: 3,
            text: 'Réponse C',
            isCorrect: false,
        },
        {
            _id: 4,
            text: 'Réponse D',
            isCorrect: false,
        },
    ];

    private baseQuestion: Question = {
        text: '',
        points: 10,
        choices: cloneDeep(this.baseChoices),
    } as Question;

    private currentQuestion: Question = cloneDeep(this.baseQuestion);
    private currentQuestionSubject: Subject<Question> = new Subject<Question>();
    private currentQuestionObservable: Observable<Question> = this.currentQuestionSubject.asObservable();

    private currentQuiz: Quiz;
    private idTracker: number = 0;

    private isPartOfQuiz: boolean;

    constructor(
        private questionService: QuestionService,
        private validationService: ValidateService,
    ) {
        this.sendChangesToComponent();
    }

    getBaseQuestion(): Question {
        return this.baseQuestion;
    }

    getBaseChoices(): Choice[] {
        return this.baseChoices;
    }

    getCurrentQuestionObservable(): Observable<Question> {
        return this.currentQuestionObservable;
    }

    getCurrentQuestion(): Question {
        return this.currentQuestion;
    }

    specifyQuiz(quiz: Quiz): void {
        this.currentQuiz = quiz;
        this.isPartOfQuiz = true;
        this.idTracker = quiz.questions.length;
    }

    resetIsPartOfQuiz() {
        this.isPartOfQuiz = false;
    }

    addChoice(): void {
        if (this.currentQuestion.type === QuestionType.QCM && !this.currentQuestion.choices) {
            this.currentQuestion.choices = [];
        }
        if (this.currentQuestion.type === QuestionType.QCM && this.currentQuestion.choices.length < this.baseChoices.length) {
            const currentIndex = this.currentQuestion.choices.length + 1;
            const newChoice: Choice = {
                _id: currentIndex,
                text: 'Ma réponse ' + currentIndex,
                isCorrect: true,
            };
            this.currentQuestion.choices.push(newChoice);
            this.sendChangesToComponent();
        }
    }

    resetQuestion(): void {
        this.currentQuestion = cloneDeep(this.baseQuestion);
        this.sendChangesToComponent();
    }

    changeChoiceCorrect(choice: Choice): void {
        choice.isCorrect = !choice.isCorrect;
    }

    specifyQuestion(id: string): void {
        this.questionService.getQuestionsById(id).subscribe({
            next: (question: Question) => {
                this.currentQuestion = question;
                this.sendChangesToComponent();
            },
        });
    }

    specifyQuestionObject(question: Question): void {
        this.currentQuestion = question;
        this.sendChangesToComponent();
    }

    submitQuestion(isPatch: boolean): void {
        if (this.isPartOfQuiz) {
            // _id est forcé par MongoDB, accepté par le prof
            // eslint-disable-next-line no-underscore-dangle
            this.currentQuestion._id = this.idTracker.toString();
            this.idTracker++;
        }
        const validatedQuestion = this.validationService.validateQuestion(this.currentQuestion).object;
        const partialQuestionNoId: Partial<Question> = {
            text: validatedQuestion.text,
            points: validatedQuestion.points,
            createdAt: validatedQuestion.createdAt,
            lastModification: validatedQuestion.lastModification,
            type: validatedQuestion.type,
        };
        if (partialQuestionNoId.type === 'QCM' && validatedQuestion.type === 'QCM') partialQuestionNoId.choices = validatedQuestion.choices;
        if (this.isPartOfQuiz) {
            // _id est forcé par MongoDB, accepté par le prof
            // eslint-disable-next-line no-underscore-dangle
            partialQuestionNoId._id = this.currentQuestion._id;
            this.currentQuestion = partialQuestionNoId as Question;
            this.submitQuestionToQuiz();
        } else if (isPatch) {
            // _id est forcé par MongoDB, accepté par le prof
            // eslint-disable-next-line no-underscore-dangle
            this.questionService.updateQuestion(this.currentQuestion._id, partialQuestionNoId as Question).subscribe({});
        } else {
            this.questionService.createQuestion(partialQuestionNoId as Question).subscribe({});
        }
        this.resetQuestion();
    }

    submitQuestionToQuiz(): void {
        this.questionService.onQuestionListUpdate(this.currentQuestion, this.currentQuiz);
        this.resetQuestion();
    }

    deleteChoice(choice: Choice): void {
        if (this.currentQuestion.type === QuestionType.QCM) {
            const choiceIndex: number = this.currentQuestion.choices.indexOf(choice);
            if (choiceIndex >= 0 && choiceIndex < this.currentQuestion.choices.length) {
                this.currentQuestion.choices.splice(choiceIndex, 1);
            }
        }
    }

    moveChoiceUp(index: number): void {
        if (this.currentQuestion.type === QuestionType.QCM) {
            if (index > 0 && index < this.currentQuestion.choices.length) {
                const temp = this.currentQuestion.choices[index];
                this.currentQuestion.choices[index] = this.currentQuestion.choices[index - 1];
                this.currentQuestion.choices[index - 1] = temp;
                this.currentQuestion.choices = [...this.currentQuestion.choices];
            }
        }
    }

    moveChoiceDown(index: number): void {
        if (this.currentQuestion.type === QuestionType.QCM) {
            if (index >= 0 && index < this.currentQuestion.choices.length - 1) {
                const temp = this.currentQuestion.choices[index];
                this.currentQuestion.choices[index] = this.currentQuestion.choices[index + 1];
                this.currentQuestion.choices[index + 1] = temp;
                this.currentQuestion.choices = [...this.currentQuestion.choices];
            }
        }
    }

    private sendChangesToComponent(): void {
        this.currentQuestionSubject.next(this.currentQuestion);
    }
}
