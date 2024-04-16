import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WORKING_QUIZ } from '@app/fake-quizzes';
import { QuestionService } from '@app/services/quiz/question.service';
import { Choice, Question, QuestionType } from '@common/types';
import { cloneDeep } from 'lodash';
import { Subscription, of } from 'rxjs';
import { OverlayService } from './overlay.service';

const baseChoices: Choice[] = [
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

const baseQuestion: Question = {
    text: '',
    points: 10,
    choices: cloneDeep(baseChoices),
} as Question;

let WORKING_QUESTION: Question;
let WORKING_CHOICE: Choice;

describe('OverlayService', () => {
    let service: OverlayService;
    let questionService: QuestionService;
    const snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: MatSnackBar, useValue: snackBarMock }],
            imports: [HttpClientModule, HttpClientTestingModule, MatSnackBarModule],
        }).compileComponents();

        service = TestBed.inject(OverlayService);
        questionService = TestBed.inject(QuestionService);
        WORKING_QUESTION = cloneDeep(WORKING_QUIZ.questions[0] as Question);
        WORKING_CHOICE = cloneDeep(WORKING_QUIZ.questions[0].choices[0] as Choice);
    });

    afterEach(() => {
        service.resetQuestion();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return the base question', () => {
        expect(service.getBaseQuestion()).toEqual(baseQuestion);
    });

    it('should return the base choices', () => {
        expect(service.getBaseChoices()).toEqual(baseChoices);
    });

    it('should return the current question observable', () => {
        spyOn(service, 'getCurrentQuestionObservable').and.returnValue(of(baseQuestion));

        const subscriber: Subscription = service.getCurrentQuestionObservable().subscribe((question) => {
            expect(question).toEqual(baseQuestion);
        });

        subscriber.unsubscribe();
    });

    it('should return the current question', () => {
        spyOn(service, 'getCurrentQuestion').and.returnValue(baseQuestion);
        const questionReturned = service.getCurrentQuestion();
        expect(questionReturned).toEqual(baseQuestion);
    });

    it('should add a choice', () => {
        const lengthBefore = WORKING_QUIZ.questions[0].choices.length;
        spyOn(questionService, 'getQuestionsById').and.callFake(() => {
            return of(WORKING_QUESTION);
        });

        // eslint-disable-next-line no-underscore-dangle
        service.specifyQuestion(WORKING_QUESTION._id);

        service.addChoice();

        const currentQuestion = service.getCurrentQuestion();

        if (currentQuestion.type === QuestionType.QCM) {
            expect(currentQuestion.choices.length).toEqual(lengthBefore + 1);
        }
    });

    it('should add a choice with specifyQuestionObject', () => {
        const lengthBefore = WORKING_QUIZ.questions[0].choices.length;

        // eslint-disable-next-line no-underscore-dangle
        service.specifyQuestionObject(WORKING_QUESTION);

        service.addChoice();

        const currentQuestion = service.getCurrentQuestion();

        if (currentQuestion.type === QuestionType.QCM) {
            expect(currentQuestion.choices.length).toEqual(lengthBefore + 1);
        }
    });

    it('should reset question', () => {
        const subscriber: Subscription = service.getCurrentQuestionObservable().subscribe({
            next: (question) => {
                expect(question).toEqual(baseQuestion);
            },
        });
        service.resetQuestion();
        subscriber.unsubscribe();
    });

    it('should change correctness of choice', () => {
        WORKING_CHOICE.isCorrect = false;
        service.toggleCorrectChoice(WORKING_CHOICE);
        expect(WORKING_CHOICE.isCorrect).toBeTrue();
    });

    it('should subscribe to getQuestionsById', () => {
        const questionServiceSpy = spyOn(questionService, 'getQuestionsById').and.returnValue(of(WORKING_QUESTION));
        const subscriber: Subscription = service.getCurrentQuestionObservable().subscribe({
            next: (question) => {
                expect(question).toEqual(WORKING_QUESTION);
            },
        });

        // eslint-disable-next-line no-underscore-dangle
        service.specifyQuestion(WORKING_QUESTION._id);

        expect(questionServiceSpy).toHaveBeenCalled();

        subscriber.unsubscribe();
    });

    it('should execute submitQuestion', () => {
        const createQuestionServiceSpy = spyOn(questionService, 'createQuestion').and.callFake((question) => {
            return of(question);
        });
        const updateQuestionServiceSpy = spyOn(questionService, 'updateQuestion').and.callFake((id, question) => {
            return of(question);
        });
        const submitQuestionToQuizSpy = spyOn(service, 'submitQuestionToQuiz').and.callThrough();

        service.submitQuestion(true);
        expect(updateQuestionServiceSpy).toHaveBeenCalled();

        service.submitQuestion(false);
        expect(createQuestionServiceSpy).toHaveBeenCalled();

        // @ts-ignore
        service.isPartOfQuiz = true;
        // @ts-ignore
        service.currentQuestion = cloneDeep(WORKING_QUESTION);
        // @ts-ignore
        service.currentQuiz = cloneDeep(WORKING_QUIZ);
        service.submitQuestion(true);
        expect(submitQuestionToQuizSpy).toHaveBeenCalled();
    });

    it('should submit a question to quiz', () => {
        const onQuestionListUpdateSpy = spyOn(questionService, 'onQuestionListUpdate').and.callFake((question, quiz) => {
            return of(question, quiz);
        });
        service.submitQuestionToQuiz(true);
        expect(onQuestionListUpdateSpy).toHaveBeenCalled();
    });

    it('should delete choice', () => {
        const lengthBefore = WORKING_QUIZ.questions[0].choices.length;

        WORKING_QUESTION.type = QuestionType.QCM;

        // @ts-ignore
        service.currentQuestion = WORKING_QUESTION;
        // @ts-ignore
        service.deleteChoice(WORKING_QUESTION.choices[0]);

        const currentQuestion = service.getCurrentQuestion();

        if (currentQuestion.type === QuestionType.QCM) {
            expect(currentQuestion.choices.length).toEqual(lengthBefore - 1);
        }
    });

    it('should move last choice up', () => {
        const choices: Choice[] = [
            { _id: 1, text: 'Answer 1', isCorrect: true },
            { _id: 2, text: 'Answer 2', isCorrect: false },
            { _id: 3, text: 'Answer 3', isCorrect: true },
            { _id: 4, text: 'Answer 4', isCorrect: false },
        ];

        const modifiedChoices: Choice[] = [
            { _id: 1, text: 'Answer 1', isCorrect: true },
            { _id: 2, text: 'Answer 2', isCorrect: false },
            { _id: 4, text: 'Answer 4', isCorrect: false },
            { _id: 3, text: 'Answer 3', isCorrect: true },
        ];

        // @ts-ignore
        service.currentQuestion.choices = choices;
        // @ts-ignore
        service.currentQuestion.type = QuestionType.QCM;

        service.moveChoiceUp(3);

        // @ts-ignore
        expect(service.currentQuestion.choices).toEqual(modifiedChoices);
    });

    it("shouldn't move choice up", () => {
        const choices: Choice[] = [
            { _id: 1, text: 'Answer 1', isCorrect: true },
            { _id: 2, text: 'Answer 2', isCorrect: false },
            { _id: 3, text: 'Answer 3', isCorrect: true },
            { _id: 4, text: 'Answer 4', isCorrect: false },
        ];

        // @ts-ignore
        service.currentQuestion.choices = cloneDeep(choices);
        // @ts-ignore
        service.currentQuestion.type = QuestionType.QCM;

        service.moveChoiceUp(0);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        service.moveChoiceUp(4);

        // @ts-ignore
        expect(service.currentQuestion.choices).toEqual(choices);
    });

    it('should move first choice down', () => {
        const choices: Choice[] = [
            { _id: 1, text: 'Answer 1', isCorrect: true },
            { _id: 2, text: 'Answer 2', isCorrect: false },
            { _id: 3, text: 'Answer 3', isCorrect: true },
            { _id: 4, text: 'Answer 4', isCorrect: false },
        ];

        const modifiedChoices: Choice[] = [
            { _id: 2, text: 'Answer 2', isCorrect: false },
            { _id: 1, text: 'Answer 1', isCorrect: true },
            { _id: 3, text: 'Answer 3', isCorrect: true },
            { _id: 4, text: 'Answer 4', isCorrect: false },
        ];

        // @ts-ignore
        service.currentQuestion.choices = choices;
        // @ts-ignore
        service.currentQuestion.type = QuestionType.QCM;

        service.moveChoiceDown(0);

        // @ts-ignore
        expect(service.currentQuestion.choices).toEqual(modifiedChoices);
    });

    it("shouldn't move choice down", () => {
        const choices: Choice[] = [
            { _id: 1, text: 'Answer 1', isCorrect: true },
            { _id: 2, text: 'Answer 2', isCorrect: false },
            { _id: 3, text: 'Answer 3', isCorrect: true },
            { _id: 4, text: 'Answer 4', isCorrect: false },
        ];
        // @ts-ignore
        service.currentQuestion.choices = cloneDeep(choices);
        // @ts-ignore
        service.currentQuestion.type = QuestionType.QCM;

        service.moveChoiceDown(3);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        service.moveChoiceDown(4);

        // @ts-ignore
        expect(service.currentQuestion.choices).toEqual(choices);
    });
});
