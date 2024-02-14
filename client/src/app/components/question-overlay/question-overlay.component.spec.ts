/* eslint-disable no-underscore-dangle */
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
import { QuestionService } from '@app/services/quiz/question.service';
import { ChoiceValidation, QuestionValidation, ValidateService } from '@app/services/validate/validate.service';
import { ValidatedObject } from '@app/services/validate/validated-object';
import { Choice, Question, QuestionType } from '@common/types';
import { cloneDeep } from 'lodash';
import { of } from 'rxjs';
import { QuestionOverlayComponent } from './question-overlay.component';

describe('QuestionOverlayComponent', () => {
    let component: QuestionOverlayComponent;
    let fixture: ComponentFixture<QuestionOverlayComponent>;
    let questionService: QuestionService;
    let validateService: ValidateService;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionOverlayComponent],
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
        fixture = TestBed.createComponent(QuestionOverlayComponent);
        component = fixture.componentInstance;
        questionService = TestBed.inject(QuestionService);
        validateService = TestBed.inject(ValidateService);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should subscribe to getId', () => {
        const getIdSpy = spyOn(questionService, 'getId').and.returnValue(of('testId'));

        component.ngOnInit();

        expect(getIdSpy).toHaveBeenCalled();
    });

    it('should call specifyQuestion', () => {
        const specifyQuestionSpy = spyOn(component, 'specifyQuestion');

        component.ngOnInit();

        questionService.sendId('testId');
        expect(specifyQuestionSpy).toHaveBeenCalled();
    });

    it('should reset choices onInit', () => {
        const resetChoicesMapSpy = spyOn(component, 'resetChoicesMap');
        component.ngOnInit();
        expect(resetChoicesMapSpy).toHaveBeenCalled();
    });

    it('should reset choices map ', () => {
        const choices: Choice[] = [
            { _id: 1, label: 'Choice 1', isCorrect: false },
            { _id: 2, label: 'Choice 2', isCorrect: true },
            { _id: 3, label: 'Choice 3', isCorrect: false },
        ];

        component.choices = choices;
        component.resetChoicesMap();

        expect(component.choiceModifier).toBeDefined();
        expect(component.choiceModifier instanceof Map).toBeTrue();

        component.choices.forEach((choice) => {
            expect(component.choiceModifier.get(choice)).toBeFalse();
        });

        const emptyChoices: Choice[] = [];
        component.choices = emptyChoices;
        component.resetChoicesMap();

        expect(component.choiceModifier).toBeDefined();
        expect(component.choiceModifier instanceof Map).toBeTrue();

        component.choices.forEach((choice) => {
            expect(component.choiceModifier.get(choice)).toBeFalse();
        });
    });

    it('should change overlay status and reset choices if display is flex', () => {
        component.overlayStatus.display = 'flex';
        const resetChoicesSpy = spyOn(component, 'resetChoices');

        component.changeOverlay();

        expect(component.overlayStatus.display).toBe('none');
        expect(resetChoicesSpy).toHaveBeenCalled();
    });

    it('should change overlay status to flex if display is none', () => {
        component.overlayStatus.display = 'none';

        component.changeOverlay();

        expect(component.overlayStatus.display).toBe('flex');
    });

    it('should change attributes, then call changeOverlay and resetChoicesMap', () => {
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
            updatedAt: new Date(),
        };

        const getQuestionsByIdSpy = spyOn(questionService, 'getQuestionsById').and.returnValue(of(mockQuestion));

        const resetChoicesMapSpy = spyOn(component, 'resetChoicesMap');
        const changeOverlaySpy = spyOn(component, 'changeOverlay');

        component.specifyQuestion('testId');

        expect(getQuestionsByIdSpy).toHaveBeenCalledWith('testId');

        expect(component.hasQuestionId).toBe(true);
        expect(component.questionId).toBe(mockQuestion._id);
        expect(component.type).toBe(mockQuestion.type);
        expect(component.title).toBe(mockQuestion.label);
        expect(component.points).toBe(mockQuestion.points);
        expect(component.choices).toEqual(mockQuestion.choices);

        expect(resetChoicesMapSpy).toHaveBeenCalled();
        expect(changeOverlaySpy).toHaveBeenCalled();
    });

    it('should change if choice is correct', () => {
        const choices: Choice[] = [
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
        ];

        component.changeChoiceCorrect(choices[0]);
        component.changeChoiceCorrect(choices[1]);

        expect(choices[0].isCorrect).toBeFalse();
        expect(choices[1].isCorrect).toBeTrue();

        component.changeChoiceCorrect(choices[0]);
        expect(choices[0].isCorrect).toBeTrue();
    });

    it('should reset attributes, reset choices and change overlay', () => {
        const resetChoicesSpy = spyOn(component, 'resetChoices');
        const changeOverlaySpy = spyOn(component, 'changeOverlay');

        component.createQuestion();

        expect(component.hasQuestionId).toBeFalse();
        expect(component.questionId).toBe('');
        expect(component.type).toBe('');
        expect(component.title).toBe('');
        expect(component.points).toBe(10);

        expect(resetChoicesSpy).toHaveBeenCalled();
        expect(changeOverlaySpy).toHaveBeenCalled();
    });

    it('should give no error message', () => {
        component.title = 'Not empty';
        component.type = QuestionType.QCM;
        component.choices = [
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
        ];
        component.points = 30;

        component.resetChoicesMap();

        expect(component.isError()).toBe(null);
    });

    it('should trigger empty title error', () => {
        component.title = '';
        expect(component.isError()).toBe(QuestionValidation.checkRequiredLabel.errorMessage);

        component.title = '      ';
        expect(component.isError()).toBe(QuestionValidation.checkRequiredLabel.errorMessage);
    });

    it('should trigger incorrect type error', () => {
        component.title = 'Not empty';
        component.type = '';

        expect(component.isError()).toBe(QuestionValidation.checkRequiredType.errorMessage);

        component.type = 'BlaBlaBla';
        expect(component.isError()).toBe(QuestionValidation.checkRequiredType.errorMessage);
    });

    it('should trigger incorrect choices amount error', () => {
        component.title = 'Not empty';
        component.type = QuestionType.QCM;
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
        component.title = 'Not empty';
        component.type = QuestionType.QCM;
        component.choices = [
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: true },
        ];

        expect(component.isError()).toBe(QuestionValidation.checkRequiredAnswers.errorMessage);

        component.choices = [
            { _id: 1, label: 'Answer 1', isCorrect: false },
            { _id: 2, label: 'Answer 2', isCorrect: false },
        ];

        expect(component.isError()).toBe(QuestionValidation.checkRequiredAnswers.errorMessage);
    });

    it('should trigger choice validation error', () => {
        component.title = 'Not empty';
        component.type = QuestionType.QCM;
        component.choices = [
            { _id: 1, label: '', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
        ];

        component.resetChoicesMap();
        component.modifyChoice(component.choices[0]);

        expect(component.isError()).toBe('Tous les choix doivent être enregistrés');
    });

    it('should trigger empty choice label error', () => {
        component.title = 'Not empty';
        component.type = QuestionType.QCM;
        component.choices = [
            { _id: 1, label: '', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
        ];

        expect(component.isError()).toBe(ChoiceValidation.checkRequiredLabel.errorMessage);
    });

    it('should trigger too low points error', () => {
        component.title = 'Not empty';
        component.type = QuestionType.QCM;
        component.choices = [
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
        ];
        component.points = 1;

        expect(component.isError()).toBe(QuestionValidation.checkMinPoints.errorMessage);
    });

    it('should trigger too high points error', () => {
        component.title = 'Not empty';
        component.type = QuestionType.QCM;
        component.choices = [
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
        ];
        component.points = 101;

        expect(component.isError()).toBe(QuestionValidation.checkMaxPoints.errorMessage);
    });

    it('should trigger not multiple of 10 points error', () => {
        component.title = 'Not empty';
        component.type = QuestionType.QCM;
        component.choices = [
            { _id: 1, label: 'Answer 1', isCorrect: true },
            { _id: 2, label: 'Answer 2', isCorrect: false },
        ];
        component.points = 11;

        expect(component.isError()).toBe(QuestionValidation.checkFormatPoints.errorMessage);
    });

    it('should save changes to a new question if there are no validation errors', () => {
        const currentDate = new Date();
        const testQuestion: Question = {
            _id: 'Test id',
            label: 'Test Title',
            points: 10,
            type: QuestionType.QCM,
            choices: [
                { _id: 1, label: 'Answer 1', isCorrect: true },
                { _id: 2, label: 'Answer 2', isCorrect: false },
            ],
            createdAt: currentDate,
            updatedAt: currentDate,
        };

        component.title = testQuestion.label;
        component.type = testQuestion.type;
        component.choices = testQuestion.choices;
        component.points = testQuestion.points;

        spyOn(validateService, 'validateQuestion').and.returnValue({
            object: testQuestion,
        } as ValidatedObject<Question>);
        const createQuestionSpy = spyOn(questionService, 'createQuestion').and.returnValue(of(testQuestion));
        const changeOverlaySpy = spyOn(component, 'changeOverlay');

        component.saveChangesToQuestion();

        expect(createQuestionSpy).toHaveBeenCalledWith(testQuestion);
        expect(changeOverlaySpy).toHaveBeenCalled();
    });

    it('should update an existing question if there are no validation errors', () => {
        const currentDate = new Date();
        const testQuestion: Question = {
            _id: 'Test id',
            label: 'Test Title',
            points: 10,
            type: QuestionType.QCM,
            choices: [
                { _id: 1, label: 'Answer 1', isCorrect: true },
                { _id: 2, label: 'Answer 2', isCorrect: false },
            ],
            createdAt: currentDate,
            updatedAt: currentDate,
        };

        component.hasQuestionId = true;
        component.questionId = testQuestion._id;
        component.title = testQuestion.label;
        component.type = testQuestion.type;
        component.choices = testQuestion.choices;
        component.points = testQuestion.points;

        spyOn(validateService, 'validateQuestion').and.returnValue({
            object: testQuestion,
        } as unknown as ValidatedObject<Question>);
        const updateQuestionSpy = spyOn(questionService, 'updateQuestion').and.returnValue(of(testQuestion));
        const changeOverlaySpy = spyOn(component, 'changeOverlay');

        component.saveChangesToQuestion();

        expect(updateQuestionSpy).toHaveBeenCalledWith(testQuestion._id, testQuestion);
        expect(changeOverlaySpy).toHaveBeenCalled();
    });

    it('should save changes to a new QRL if there are no validation errors', () => {
        const currentDate = new Date();
        const testQuestion: Question = {
            _id: 'Test id',
            label: 'Test Title',
            points: 10,
            type: QuestionType.QRL,
            createdAt: currentDate,
            updatedAt: currentDate,
        };

        component.title = testQuestion.label;
        component.type = testQuestion.type;
        component.points = testQuestion.points;

        spyOn(validateService, 'validateQuestion').and.returnValue({
            object: testQuestion,
        } as unknown as ValidatedObject<Question>);
        const createQuestionSpy = spyOn(questionService, 'createQuestion').and.returnValue(of(testQuestion));
        const changeOverlaySpy = spyOn(component, 'changeOverlay');

        component.saveChangesToQuestion();

        expect(createQuestionSpy).toHaveBeenCalledWith(testQuestion);
        expect(changeOverlaySpy).toHaveBeenCalled();
    });

    it('should update an existing QRL if there are no validation errors', () => {
        const currentDate = new Date();
        const testQuestion: Question = {
            _id: 'Test id',
            label: 'Test Title',
            points: 10,
            type: QuestionType.QRL,
            createdAt: currentDate,
            updatedAt: currentDate,
        };

        component.hasQuestionId = true;
        component.questionId = testQuestion._id;
        component.title = testQuestion.label;
        component.type = testQuestion.type;
        component.points = testQuestion.points;

        spyOn(validateService, 'validateQuestion').and.returnValue({
            object: testQuestion,
        } as unknown as ValidatedObject<Question>);
        const updateQuestionSpy = spyOn(questionService, 'updateQuestion').and.returnValue(of(testQuestion));
        const changeOverlaySpy = spyOn(component, 'changeOverlay');

        component.saveChangesToQuestion();

        expect(updateQuestionSpy).toHaveBeenCalledWith(testQuestion._id, testQuestion);
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
