/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuizService } from '@app/services/quiz/quiz.service';
import { ChoiceValidation, QuestionValidation, ValidateService } from '@app/services/validate/validate.service';
import { ValidatedObject } from '@app/services/validate/validated-object';
import { Choice, Question, QuestionType } from '@common/types';
import { cloneDeep } from 'lodash';
import { of } from 'rxjs';
import { QuizQuestionOverlayComponent } from './quiz-question-overlay.component';

const mockQuestion: Question = {
    _id: 'testId',
    type: QuestionType.QCM,
    label: 'This is a test',
    points: 10,
    choices: [
        { _id: 1, label: 'Correct Answer', isCorrect: true },
        { _id: 2, label: 'Incorrect Answer', isCorrect: false },
    ],
    createdAt: new Date(),
    lastModified: new Date(),
};

describe('QuizQuestionOverlayComponent', () => {
    let component: QuizQuestionOverlayComponent;
    let fixture: ComponentFixture<QuizQuestionOverlayComponent>;
    let quizService: QuizService;
    let validateService: ValidateService;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuizQuestionOverlayComponent],
            imports: [
                HttpClientModule,
                HttpClientTestingModule,
                FormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatSelectModule,
                BrowserAnimationsModule,
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuizQuestionOverlayComponent);
        component = fixture.componentInstance;
        quizService = TestBed.inject(QuizService);
        validateService = TestBed.inject(ValidateService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(quizService).toBeTruthy();
        expect(validateService).toBeTruthy();
        expect(component).toBeTruthy();
    });

    it('should subscribe to getAmountOfQuizzes and update idTracker', () => {
        const getAmountOfQuizzesSpy = spyOn(quizService, 'getAmountOfQuizzes').and.returnValue(of(1));

        component.ngOnInit();

        expect(getAmountOfQuizzesSpy).toHaveBeenCalled();
        expect(component.idTracker).toEqual(1);
    });

    it('should reset choices map', () => {
        const resetChoicesMapSpy = spyOn(component, 'resetChoicesMap');

        component.ngOnInit();

        expect(resetChoicesMapSpy).toHaveBeenCalled();
    });

    it('should change overlay status and reset choices if display is flex', () => {
        component.overlayStatus.display = 'flex';

        component.changeOverlay();

        expect(component.overlayStatus.display).toBe('none');
    });

    it('should change overlay status to flex if display is none', () => {
        component.overlayStatus.display = 'none';

        component.changeOverlay();

        expect(component.overlayStatus.display).toBe('flex');
    });

    it('should call specifyQuestion', () => {
        const resetChoicesMapSpy = spyOn(component, 'resetChoicesMap');
        const changeOverlaySpy = spyOn(component, 'changeOverlay');

        component.specifyQuestion(mockQuestion);

        expect(component.hasQuestionId).toBeTrue();
        expect(component.currentQuestion).toEqual(mockQuestion);
        expect(component.choices).toEqual(mockQuestion.choices);
        expect(resetChoicesMapSpy).toHaveBeenCalled();
        expect(changeOverlaySpy).toHaveBeenCalled();
    });

    it('should change if choice is correct', () => {
        const choices: Choice[] = mockQuestion.choices;

        component.changeChoiceCorrect(choices[0]);
        component.changeChoiceCorrect(choices[1]);

        expect(choices[0].isCorrect).toBeFalse();
        expect(choices[1].isCorrect).toBeTrue();

        component.changeChoiceCorrect(choices[0]);
        expect(choices[0].isCorrect).toBeTrue();
    });

    it('should create new question', () => {
        component.idTracker = 0;
        const newQuestion: Question = component.baseQuestion as Question;
        // eslint-disable-next-line no-underscore-dangle
        newQuestion._id = '1';

        const resetChoicesMapSpy = spyOn(component, 'resetChoicesMap');
        const changeOverlaySpy = spyOn(component, 'changeOverlay');

        component.createQuestion();

        expect(component.hasQuestionId).toBeFalse();
        expect(component.currentQuestion).toEqual(newQuestion);
        expect(resetChoicesMapSpy).toHaveBeenCalled();
        expect(changeOverlaySpy).toHaveBeenCalled();
    });

    it('should give no error message', () => {
        component.currentQuestion = cloneDeep(mockQuestion);
        component.choices = [
            { _id: 1, label: 'Correct Answer', isCorrect: true },
            { _id: 2, label: 'Incorrect Answer', isCorrect: false },
        ];
        component.resetChoicesMap();

        expect(component.isError()).toBe(null);
    });

    it('should trigger empty title error', () => {
        component.currentQuestion = cloneDeep(mockQuestion);

        component.currentQuestion.label = '';
        expect(component.isError()).toBe(QuestionValidation.checkRequiredLabel.errorMessage);

        component.currentQuestion.label = '    ';
        expect(component.isError()).toBe(QuestionValidation.checkRequiredLabel.errorMessage);
    });

    it('should trigger incorrect type error', () => {
        component.currentQuestion = component.baseQuestion as Question;
        component.currentQuestion.label = 'Not Empty';

        expect(component.isError()).toBe(QuestionValidation.checkRequiredType.errorMessage);
    });

    it('should trigger incorrect choices amount error', () => {
        component.currentQuestion = cloneDeep(mockQuestion);

        component.choices = [{ _id: 1, label: 'Answer 1', isCorrect: true }];
        expect(component.isError()).toBe(QuestionValidation.checkEnoughChoices.errorMessage);

        component.choices = [
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
            { _id: 3, label: 'Answer 3', isCorrect: false },
            { _id: 4, label: 'Answer 4', isCorrect: false },
            { _id: 5, label: 'Answer 5', isCorrect: false },
        ];
        expect(component.isError()).toBe(QuestionValidation.checkEnoughChoices.errorMessage);
    });

    it('should trigger incorrect choice correctness error', () => {
        component.currentQuestion = cloneDeep(mockQuestion);
        component.choices = [
            { _id: 1, label: 'Correct Answer', isCorrect: true },
            { _id: 2, label: 'Incorrect Answer', isCorrect: false },
        ];
        component.changeChoiceCorrect(component.choices[1]);

        expect(component.isError()).toBe(QuestionValidation.checkRequiredAnswers.errorMessage);

        component.choices = [
            { _id: 1, label: 'Correct Answer', isCorrect: true },
            { _id: 2, label: 'Incorrect Answer', isCorrect: false },
        ];
        component.changeChoiceCorrect(component.choices[0]);

        expect(component.isError()).toBe(QuestionValidation.checkRequiredAnswers.errorMessage);
    });

    it('should trigger choice validation error', () => {
        component.currentQuestion = cloneDeep(mockQuestion);
        component.choices = [
            { _id: 1, label: 'Correct Answer', isCorrect: true },
            { _id: 2, label: 'Incorrect Answer', isCorrect: false },
        ];

        component.resetChoicesMap();
        component.modifyChoice(component.choices[0]);

        expect(component.isError()).toBe('Tous les choix doivent être enregistrés');
    });

    it('should trigger empty choice label error', () => {
        component.currentQuestion = cloneDeep(mockQuestion);
        component.choices = [
            { _id: 1, label: 'Correct Answer', isCorrect: true },
            { _id: 2, label: 'Incorrect Answer', isCorrect: false },
        ];
        component.choices[0].label = '';

        expect(component.isError()).toBe(ChoiceValidation.checkRequiredLabel.errorMessage);
    });

    it('should trigger too low points error', () => {
        component.currentQuestion = cloneDeep(mockQuestion);
        component.choices = [
            { _id: 1, label: 'Correct Answer', isCorrect: true },
            { _id: 2, label: 'Incorrect Answer', isCorrect: false },
        ];
        component.currentQuestion.points = 1;

        expect(component.isError()).toBe(QuestionValidation.checkMinPoints.errorMessage);
    });

    it('should trigger too high points error', () => {
        component.currentQuestion = cloneDeep(mockQuestion);
        component.choices = [
            { _id: 1, label: 'Correct Answer', isCorrect: true },
            { _id: 2, label: 'Incorrect Answer', isCorrect: false },
        ];
        component.currentQuestion.points = 101;

        expect(component.isError()).toBe(QuestionValidation.checkMaxPoints.errorMessage);
    });

    it('should trigger not multiple of 10 points error', () => {
        component.currentQuestion = cloneDeep(mockQuestion);
        component.choices = [
            { _id: 1, label: 'Correct Answer', isCorrect: true },
            { _id: 2, label: 'Incorrect Answer', isCorrect: false },
        ];
        component.currentQuestion.points = 11;

        expect(component.isError()).toBe(QuestionValidation.checkFormatPoints.errorMessage);
    });

    it('should save changes to a new question if there are no validation errors', () => {
        component.currentQuestion = cloneDeep(mockQuestion);
        component.choices = [
            { _id: 1, label: 'Correct Answer', isCorrect: true },
            { _id: 2, label: 'Incorrect Answer', isCorrect: false },
        ];
        component.resetChoicesMap();

        spyOn(validateService, 'validateQuestion').and.returnValue({
            object: mockQuestion,
        } as ValidatedObject<Question>);

        let emittedQuestion: Question = component.baseQuestion as Question;
        component.questionEmitter.subscribe((question: Question) => {
            emittedQuestion = question;
        });

        const resetChoicesMapSpy = spyOn(component, 'resetChoicesMap');
        const changeOverlaySpy = spyOn(component, 'changeOverlay');

        component.saveChangesToQuestion();

        expect(emittedQuestion).toEqual(mockQuestion);
        expect(resetChoicesMapSpy).toHaveBeenCalled();
        expect(changeOverlaySpy).toHaveBeenCalled();
    });

    it('should delete choice', () => {
        const choices: Choice[] = [
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
        ];
        component.choices = choices;
        const resetChoicesMapSpy = spyOn(component, 'resetChoicesMap');

        component.deleteChoice(component.choices[0]);

        expect(component.choices.length).toEqual(1);
        expect(resetChoicesMapSpy).toHaveBeenCalled();
    });

    it("shouldn't delete choice", () => {
        const choices: Choice[] = [
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
        ];
        component.choices = choices;

        component.deleteChoice({ _id: 3, label: 'Answer 3', isCorrect: true });

        expect(component.choices.length).toEqual(2);
    });

    it('should add choice', () => {
        const choices: Choice[] = [
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
        ];
        component.choices = choices;
        const resetChoicesMapSpy = spyOn(component, 'resetChoicesMap');

        component.addChoice();

        expect(component.choices.length).toEqual(3);
        expect(resetChoicesMapSpy).toHaveBeenCalled();
    });

    it("shouldn't add choice", () => {
        const choices: Choice[] = [
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
            { _id: 3, label: 'Answer 3', isCorrect: true },
            { _id: 4, label: 'Answer 4', isCorrect: false },
        ];
        component.choices = choices;

        component.addChoice();

        expect(component.choices.length).toEqual(4);
    });

    it('should reset choices', () => {
        const choices: Choice[] = [
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
            { _id: 3, label: 'Answer 3', isCorrect: true },
            { _id: 4, label: 'Answer 4', isCorrect: false },
        ];
        component.choices = choices;

        component.resetChoices();

        expect(component.choices).not.toEqual(choices);
        expect(component.choices).toEqual(component.baseChoices);
    });

    it('should move last choice up', () => {
        const choices: Choice[] = [
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
            { _id: 3, label: 'Answer 3', isCorrect: true },
            { _id: 4, label: 'Answer 4', isCorrect: false },
        ];

        const modifiedChoices: Choice[] = [
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
            { _id: 4, label: 'Answer 4', isCorrect: false },
            { _id: 3, label: 'Answer 3', isCorrect: true },
        ];
        component.choices = choices;

        component.moveChoiceUp(3);

        expect(component.choices).toEqual(modifiedChoices);
    });

    it("shouldn't move choice up", () => {
        const choices: Choice[] = [
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
            { _id: 3, label: 'Answer 3', isCorrect: true },
            { _id: 4, label: 'Answer 4', isCorrect: false },
        ];

        component.choices = cloneDeep(choices);

        component.moveChoiceUp(0);
        component.moveChoiceUp(4);
        expect(component.choices).toEqual(choices);
    });

    it('should move first choice down', () => {
        const choices: Choice[] = [
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
            { _id: 3, label: 'Answer 3', isCorrect: true },
            { _id: 4, label: 'Answer 4', isCorrect: false },
        ];

        const modifiedChoices: Choice[] = [
            { _id: 2, label: 'Answer 2', isCorrect: false },
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 3, label: 'Answer 3', isCorrect: true },
            { _id: 4, label: 'Answer 4', isCorrect: false },
        ];
        component.choices = choices;

        component.moveChoiceDown(0);

        expect(component.choices).toEqual(modifiedChoices);
    });

    it("shouldn't move choice down", () => {
        const choices: Choice[] = [
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
            { _id: 3, label: 'Answer 3', isCorrect: true },
            { _id: 4, label: 'Answer 4', isCorrect: false },
        ];
        component.choices = cloneDeep(choices);

        component.moveChoiceDown(3);
        component.moveChoiceDown(4);

        expect(component.choices).toEqual(choices);
    });
});
