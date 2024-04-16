/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BAD_QUIZ, WORKING_QUIZ } from '@app/fake-quizzes';
import { OverlayService } from '@app/services/overlay/overlay.service';
import { QuestionService } from '@app/services/quiz/question.service';
import { Variables } from '@common/enum-variables';
import { Choice, Question, QuestionType } from '@common/types';
import { cloneDeep } from 'lodash';
import { of } from 'rxjs';
import { QuestionOverlayComponent } from './question-overlay.component';

let WORKING_QUESTION: Question;
let BAD_QUESTION: Question;
let WORKING_CHOICE: Choice;

describe('QuestionOverlayComponent', () => {
    let component: QuestionOverlayComponent;
    let fixture: ComponentFixture<QuestionOverlayComponent>;
    let questionService: QuestionService;
    let overlayService: OverlayService;
    const snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionOverlayComponent],
            providers: [{ provide: MatSnackBar, useValue: snackBarMock }],
            imports: [
                HttpClientModule,
                HttpClientTestingModule,
                FormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatSelectModule,
                BrowserAnimationsModule,
                MatSnackBarModule,
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionOverlayComponent);
        component = fixture.componentInstance;
        questionService = TestBed.inject(QuestionService);
        overlayService = TestBed.inject(OverlayService);
        fixture.detectChanges();

        WORKING_QUESTION = cloneDeep(WORKING_QUIZ.questions[0] as Question);
        BAD_QUESTION = cloneDeep(BAD_QUIZ.questions[1] as Question);
        WORKING_CHOICE = cloneDeep(WORKING_QUIZ.questions[0].choices[0] as Choice);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should subscribe to getId', () => {
        const getIdSpy = spyOn(questionService, 'getId').and.returnValue(of('testId'));

        component.ngOnInit();

        expect(getIdSpy).toHaveBeenCalled();
    });

    it('should subscribe to getCurrentQuestion', () => {
        const getQuestionSpy = spyOn(overlayService, 'getCurrentQuestionObservable').and.returnValue(of(WORKING_QUESTION));

        component.ngOnInit();

        expect(getQuestionSpy).toHaveBeenCalled();
        expect(component.currentQuestion).toBe(WORKING_QUESTION);
    });

    it('should call specifyQuestion', () => {
        const specifyQuestionSpy = spyOn(component, 'specifyQuestion');

        component.ngOnInit();

        questionService.sendId('testId');
        expect(specifyQuestionSpy).toHaveBeenCalled();
    });

    it('should execute specifyQuestion', () => {
        component.hasQuestionId = false;

        const overlayServiceSpy = spyOn(overlayService, 'specifyQuestion');
        const changeOverlaySpy = spyOn(component, 'changeOverlay');

        component.ngOnInit();
        questionService.sendId('123');

        expect(overlayServiceSpy).toHaveBeenCalled();
        expect(changeOverlaySpy).toHaveBeenCalled();
        expect(component.hasQuestionId).toBeTrue();
    });

    it('should execute specifyQuestionObject', () => {
        component.hasQuestionId = false;

        const overlayServiceSpy = spyOn(overlayService, 'specifyQuestionObject');
        const changeOverlaySpy = spyOn(component, 'changeOverlay');

        component.specifyQuestionObject(WORKING_QUESTION);

        expect(overlayServiceSpy).toHaveBeenCalled();
        expect(changeOverlaySpy).toHaveBeenCalled();
        expect(component.hasQuestionId).toBeTrue();
    });

    it('should change overlay status and reset choices if display is flex', () => {
        component.isActiveOverlay = true;

        component.changeOverlay();

        expect(component.isActiveOverlay).toBeFalse();
    });

    it('should change overlay status to flex if display is none', () => {
        component.isActiveOverlay = false;

        component.changeOverlay();

        expect(component.isActiveOverlay).toBeTrue();
    });

    it('should call changeChoiceCorrect in OverlayService', () => {
        const overlayServiceSpy = spyOn(overlayService, 'changeChoiceCorrect');

        component.changeChoiceCorrect(WORKING_CHOICE);

        expect(overlayServiceSpy).toHaveBeenCalled();
    });

    it('should execute newQuestion', () => {
        component.hasQuestionId = true;
        const overlayServiceSpy = spyOn(overlayService, 'resetQuestion');
        const changeOverlaySpy = spyOn(component, 'changeOverlay');

        component.newQuestion();

        expect(overlayServiceSpy).toHaveBeenCalled();
        expect(changeOverlaySpy).toHaveBeenCalled();
        expect(component.hasQuestionId).toBe(false);
    });

    it("should return null if the question wasn't loaded", () => {
        component.currentQuestion = null as unknown as Question;

        const returnValue = component.isError();

        expect(returnValue).toBeNull();
    });

    it('should return null if there were no errors', () => {
        component.currentQuestion = WORKING_QUESTION;

        const returnValue = component.isError();

        expect(returnValue).toBeFalsy();
    });

    it('should return one error if there is at least one', () => {
        component.currentQuestion = BAD_QUESTION;

        const returnValue = component.isError();

        expect(typeof returnValue).toBe('string');
    });

    it('should have an error if still modifying one choice', () => {
        component.currentQuestion = WORKING_QUESTION;
        component.modifyChoice(WORKING_CHOICE);
        const returnValue = component.isError();
        expect(returnValue).toEqual('Tous les choix doivent être enregistrés');
    });

    it('should execute saveChangesToQuestion', () => {
        component.currentQuestion = WORKING_QUESTION;
        const overlayServiceSpy = spyOn(overlayService, 'submitQuestion');
        const changeOverlaySpy = spyOn(component, 'changeOverlay');

        component.saveChangesToQuestion();

        expect(overlayServiceSpy).toHaveBeenCalled();
        expect(changeOverlaySpy).toHaveBeenCalled();
    });

    it('should execute modifyChoice', () => {
        component.currentQuestion = WORKING_QUESTION;

        component.modifyChoice(WORKING_CHOICE);

        expect(component.isModifyingChoiceMap.get(WORKING_CHOICE)).toBeTrue();
    });

    it('should call deleteChoice in OverlayService', () => {
        const overlayServiceSpy = spyOn(overlayService, 'deleteChoice');

        component.deleteChoice(WORKING_CHOICE);

        expect(overlayServiceSpy).toHaveBeenCalled();
    });

    it('should call addChoice in OverlayService', () => {
        const overlayServiceSpy = spyOn(overlayService, 'addChoice');

        component.addChoice();

        expect(overlayServiceSpy).toHaveBeenCalled();
    });

    it('should call moveChoiceUp in OverlayService', () => {
        const overlayServiceSpy = spyOn(overlayService, 'moveChoiceUp');

        component.moveChoiceUp(1);

        expect(overlayServiceSpy).toHaveBeenCalled();
    });

    it('should call moveChoiceDown in OverlayService', () => {
        const overlayServiceSpy = spyOn(overlayService, 'moveChoiceDown');

        component.moveChoiceDown(1);

        expect(overlayServiceSpy).toHaveBeenCalled();
    });

    it('should return true if a choice is not modifying', () => {
        const testChoice = { _id: 1, text: 'Test', isCorrect: false };
        component.isModifyingChoiceMap.set(testChoice, false);
        expect(component.isChoiceNotModifying(testChoice)).toBeTrue();
    });

    it('should return false if a choice is modifying', () => {
        const testChoice = { _id: 1, text: 'Test', isCorrect: false };
        component.isModifyingChoiceMap.set(testChoice, true);
        expect(component.isChoiceNotModifying(testChoice)).toBeFalse();
    });

    it('should return true if a choice is modifying', () => {
        const testChoice = { _id: 1, text: 'Test', isCorrect: false };
        component.isModifyingChoiceMap.set(testChoice, true);
        expect(component.isChoiceModifying(testChoice)).toBeTrue();
    });

    it('should return false if a choice is not modifying', () => {
        const testChoice = { _id: 1, text: 'Test', isCorrect: false };
        component.isModifyingChoiceMap.set(testChoice, false);
        expect(component.isChoiceModifying(testChoice)).toBeFalse();
    });

    it('should allow adding more choices if the number of choices is below the maximum for QCM type', () => {
        const currentDate = new Date();
        component.currentQuestion = {
            _id: '1',
            type: QuestionType.QCM,
            choices: new Array(Variables.QCMMaxChoicesAmount - 1).fill({}),
            text: '',
            points: 1,
            createdAt: currentDate,
            lastModification: currentDate,
        };
        expect(component.canAddMoreChoices()).toBeTrue();
    });

    it('should not allow adding more choices if the number of choices reaches the maximum for QCM type', () => {
        const currentDate = new Date();
        component.currentQuestion = {
            _id: '1',
            type: QuestionType.QCM,
            choices: new Array(Variables.QCMMaxChoicesAmount).fill({}),
            text: '',
            points: 1,
            createdAt: currentDate,
            lastModification: currentDate,
        };
        expect(component.canAddMoreChoices()).toBeFalse();
    });

    it('should not allow adding more choices if the question type is not QCM', () => {
        const currentDate = new Date();
        component.currentQuestion = {
            _id: '1',
            type: QuestionType.QRL,
            text: '',
            points: 1,
            createdAt: currentDate,
            lastModification: currentDate,
        };
        expect(component.canAddMoreChoices()).toBeFalse();
    });
});
