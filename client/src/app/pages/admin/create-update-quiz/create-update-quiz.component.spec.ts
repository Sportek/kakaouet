/* eslint-disable max-lines */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { QuizValidation } from '@app/classes/validate';
import { ValidatedObject } from '@app/classes/validated-object';
import { ConfirmationService } from '@app/services/confirmation/confirmation.service';
import { QuestionService } from '@app/services/quiz/question.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { ValidateService } from '@app/services/validate/validate.service';
import { Question, QuestionType, Quiz } from '@common/types';
import { cloneDeep } from 'lodash';
import { of, throwError } from 'rxjs';
import { CreateUpdateQuizComponent } from './create-update-quiz.component';

const currentDate = new Date();

const mockQuestion1 = {
    _id: '1',
    text: 'Question 1',
    points: 10,
    createdAt: currentDate,
    lastModification: currentDate,
    type: QuestionType.QCM,
    choices: [
        { _id: 1, text: 'Choice 1', isCorrect: true },
        { _id: 2, text: 'Choice 2', isCorrect: false },
    ],
};

const mockQuestion2 = {
    _id: '2',
    text: 'Question 2',
    points: 5,
    createdAt: new Date('2024-02-12T00:00:00'),
    lastModification: new Date('2024-02-12T00:00:00'),
    type: QuestionType.QRL,
} as Question;

const mockQuiz: Quiz = {
    _id: 'fakeID',
    title: 'Test Quiz',
    description: "Ceci est la description d'un quiz",
    duration: 10,
    // Quiz is accessible to all users
    visibility: true,
    questions: [mockQuestion1, mockQuestion2],
    createdAt: currentDate,
    lastModification: currentDate,
};

describe('CreateUpdateQuizComponent', () => {
    let component: CreateUpdateQuizComponent;
    let fixture: ComponentFixture<CreateUpdateQuizComponent>;
    let questionService: QuestionService;
    let quizService: QuizService;
    let validateService: ValidateService;
    let mockConfirmationService: ConfirmationService;

    beforeEach(async () => {
        mockConfirmationService = {
            confirm: jasmine.createSpy('confirm').and.callFake((message, callback) => callback()),
            dialog: {} as MatDialog, // Add the missing 'dialog' property
        };
        TestBed.configureTestingModule({
            declarations: [CreateUpdateQuizComponent],
            imports: [HttpClientTestingModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, BrowserAnimationsModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: new Map().set('id', 'fakeID') },
                    },
                },
                { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
                { provide: ConfirmationService, useValue: mockConfirmationService },
            ],
        });

        await TestBed.compileComponents();

        fixture = TestBed.createComponent(CreateUpdateQuizComponent);
        questionService = TestBed.inject(QuestionService);
        quizService = TestBed.inject(QuizService);
        validateService = TestBed.inject(ValidateService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should call getQuiz method with game id from route', () => {
            spyOn(component, 'getQuiz');
            component.ngOnInit();
            expect(component.getQuiz).toHaveBeenCalledWith('fakeID');
        });
    });

    describe('openImportOverlay', () => {
        it('should set showImportOverlay to true', () => {
            component.openImportOverlay();
            expect(component.showImportOverlay).toBeTrue();
        });
    });

    describe('closeImportOverlay', () => {
        it('should set showImportOverlay to false', () => {
            component.showImportOverlay = true;
            component.closeImportOverlay();
            expect(component.showImportOverlay).toBeFalse();
        });
    });

    describe('moveQuestionUp', () => {
        it('should move the question up when index is greater than 0', () => {
            component.quiz.questions = [mockQuestion1, mockQuestion2];
            component.moveQuestionUp(1);
            expect(component.quiz.questions).toEqual([mockQuestion2, mockQuestion1]);
        });

        it('should not move the question up when index is 0 or negative', () => {
            component.quiz.questions = [mockQuestion1, mockQuestion2];
            component.moveQuestionUp(0);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            component.moveQuestionUp(-1);
            expect(component.quiz.questions).toEqual([mockQuestion1, mockQuestion2]);
        });
    });

    describe('moveQuestionDown', () => {
        it('should move the question down when index is less than the last index', () => {
            component.quiz.questions = [mockQuestion1, mockQuestion2];
            component.moveQuestionDown(0);
            expect(component.quiz.questions).toEqual([mockQuestion2, mockQuestion1]);
        });

        it('should not move the question down when index is the last index or greater', () => {
            component.quiz.questions = [mockQuestion1, mockQuestion2];
            component.moveQuestionDown(1);
            component.moveQuestionDown(3);
            expect(component.quiz.questions).toEqual([mockQuestion1, mockQuestion2]);
        });
    });

    describe('handleQuestionsImported', () => {
        it('should add new questions to quiz.questions and sort them by ID', () => {
            component.quiz.questions = [mockQuestion1];

            component.handleQuestionsImported([mockQuestion2]);

            // eslint-disable-next-line no-underscore-dangle
            expect(component.quiz.questions).toEqual([mockQuestion1, mockQuestion2].sort((a, b) => a._id.localeCompare(b._id)));

            expect(component.showImportOverlay).toBeFalse();
        });
    });

    describe('updateQuiz', () => {
        it('should update the quiz and call updateQuizById with the correct parameters', () => {
            const updatedQuiz: Quiz = cloneDeep(mockQuiz);
            updatedQuiz.title = 'Updated Quiz Name';
            updatedQuiz.lastModification = new Date();

            component.quiz.title = updatedQuiz.title;
            component.quiz.description = updatedQuiz.description;
            component.quiz.duration = updatedQuiz.duration;
            component.quiz.visibility = updatedQuiz.visibility;
            component.quiz.questions = [mockQuestion1, mockQuestion2];

            const validatedQuiz: ValidatedObject<Quiz> = validateService.validateQuiz(updatedQuiz);

            const updateQuizSpy = spyOn(quizService, 'updateQuizById').and.returnValue(of(updatedQuiz));
            const validateQuizSpy = spyOn(validateService, 'validateQuiz').and.returnValue(validatedQuiz);

            component.updateQuiz(updatedQuiz);

            expect(validateQuizSpy).toHaveBeenCalledWith(updatedQuiz);
            // eslint-disable-next-line no-underscore-dangle
            expect(updateQuizSpy).toHaveBeenCalledWith(updatedQuiz._id, validatedQuiz.object);
        });
    });

    describe('removeQuestion', () => {
        it('should remove the specified question from quiz.questions', () => {
            component.quiz.questions = [mockQuestion1, mockQuestion2];
            component.removeQuestion(mockQuestion1);
            expect(component.quiz.questions).not.toContain(mockQuestion1);
            expect(component.quiz.questions).toContain(mockQuestion2);
        });

        it('should not remove the specified question from quiz.questions', () => {
            component.quiz.questions = [mockQuestion1, mockQuestion2];
            const questionToRemove: Question = {
                _id: '5',
                text: 'Question 5',
                points: 8,
                createdAt: new Date('2024-02-12T00:00:00'),
                lastModification: new Date('2024-02-12T00:00:00'),
                type: QuestionType.QCM,
                choices: [
                    { _id: 1, text: 'Choice 1', isCorrect: true },
                    { _id: 2, text: 'Choice 2', isCorrect: false },
                ],
            };
            component.removeQuestion(questionToRemove);
            expect(component.quiz.questions).toContain(mockQuestion1);
            expect(component.quiz.questions).toContain(mockQuestion2);
        });
    });

    describe('createQuiz', () => {
        it('should create a new quiz and call addNewQuiz with the correct parameters', () => {
            const newQuiz: Quiz = {
                _id: 'fakeID',
                title: 'New Quiz Name',
                description: 'New Quiz Description',
                duration: 60,
                visibility: false,
                questions: [mockQuestion1, mockQuestion2],
                createdAt: new Date(),
                lastModification: new Date(),
            };

            component.quiz.title = newQuiz.title;
            component.quiz.description = newQuiz.description;
            component.quiz.duration = newQuiz.duration;
            component.quiz.questions = [mockQuestion1, mockQuestion2];

            const addNewQuizSpy = spyOn(quizService, 'addNewQuiz').and.returnValue(of(newQuiz));

            component.createQuiz();

            expect(addNewQuizSpy).toHaveBeenCalledWith({
                title: 'New Quiz Name',
                description: 'New Quiz Description',
                duration: 60,
                visibility: false,
                questions: [mockQuestion1, mockQuestion2],
            } as Quiz);
        });
    });

    describe('importQuestionToBank', () => {
        it('should import the question to the question bank if it does not already exist', () => {
            const questionToImport: Partial<Question> = {
                text: 'Question 1',
                points: 10,
                createdAt: currentDate,
                lastModification: currentDate,
                type: QuestionType.QCM,
                choices: [
                    { _id: 1, text: 'Choice 1', isCorrect: true },
                    { _id: 2, text: 'Choice 2', isCorrect: false },
                ],
            };

            const questionsFromBank: Question[] = [mockQuestion2];

            spyOn(questionService, 'getQuestions').and.returnValue(of(questionsFromBank));
            const createQuestionSpy = spyOn(questionService, 'createQuestion').and.returnValue(of(mockQuestion1));

            component.importQuestionToBank(mockQuestion1);

            expect(createQuestionSpy).toHaveBeenCalledWith(questionToImport as Question);
        });

        it('should not call createQuestion if the question already exists in the question bank', () => {
            const questionsFromBank: Question[] = [mockQuestion1, mockQuestion2];

            spyOn(questionService, 'getQuestions').and.returnValue(of(questionsFromBank));
            const createQuestionSpy = spyOn(questionService, 'createQuestion').and.returnValue(of(mockQuestion1));

            component.importQuestionToBank(mockQuestion1);

            expect(createQuestionSpy).not.toHaveBeenCalled();
        });
    });

    describe('onSubmit', () => {
        it('should call updateQuiz if hasId exist', () => {
            const quizToUpdate: Quiz = cloneDeep(mockQuiz);

            // eslint-disable-next-line no-underscore-dangle
            component.quiz._id = mockQuiz._id;
            component.quiz = quizToUpdate;

            const updateQuizSpy = spyOn(component, 'updateQuiz').and.callThrough();
            const getQuizSpy = spyOn(quizService, 'getQuizById').and.returnValue(of(quizToUpdate));

            component.onSubmit();

            expect(getQuizSpy).toHaveBeenCalled();
            expect(updateQuizSpy).toHaveBeenCalledWith(quizToUpdate);
        });

        it('should create quiz if no longer in database', () => {
            const quizToUpdate: Quiz = cloneDeep(mockQuiz);

            // eslint-disable-next-line no-underscore-dangle
            component.quiz._id = mockQuiz._id;
            component.quiz = quizToUpdate;

            const createQuizSpy = spyOn(component, 'createQuiz').and.callThrough();
            const getQuizSpy = spyOn(quizService, 'getQuizById').and.returnValue(throwError(() => new Error()));

            component.onSubmit();

            expect(getQuizSpy).toHaveBeenCalled();
            expect(createQuizSpy).toHaveBeenCalled();
        });

        it('should call createQuiz if hasId doesnt exist', () => {
            const createQuizSpy = spyOn(component, 'createQuiz').and.callThrough();
            component.onSubmit();
            expect(createQuizSpy).toHaveBeenCalled();
        });
    });

    describe('hasError', () => {
        it('should give no error message', () => {
            component.quiz.title = 'TestId';
            component.quiz.duration = 10;
            component.quiz.description = 'Voici un quiz de test';
            component.quiz.questions = [mockQuestion1];

            expect(component.hasError()).toEqual(undefined);
        });

        it('should trigger empty title error', () => {
            component.quiz.title = '';

            expect(component.hasError()).toEqual(QuizValidation.checkRequiredName.errorMessage);
        });

        it('should trigger too long title error', () => {
            component.quiz.title =
                // eslint-disable-next-line max-len
                'Ce titre est très loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong';

            expect(component.hasError()).toBe(QuizValidation.checkMaxTitleLength.errorMessage);
        });

        it('should trigger too long word in title error', () => {
            component.quiz.title =
                // eslint-disable-next-line max-len
                'Ce mot est très looooooooooooooooooooooooooooooooooong';

            expect(component.hasError()).toBe(QuizValidation.checkMaxWordLength.errorMessage);
        });

        it('should trigger too short answer duration error', () => {
            component.quiz.title = 'TestId';
            component.quiz.duration = 1;
            component.quiz.description = 'Blablablabla';
            component.quiz.questions = [mockQuestion1];

            expect(component.hasError()).toBe(QuizValidation.checkMinResponseTime.errorMessage);
        });

        it('should trigger too long answer duration error', () => {
            component.quiz.title = 'TestId';
            component.quiz.duration = 100;
            component.quiz.description = 'Blablablabla';
            component.quiz.questions = [mockQuestion1];

            expect(component.hasError()).toBe(QuizValidation.checkMaxResponseTime.errorMessage);
        });

        it('should trigger too short description error', () => {
            component.quiz.title = 'TestId';
            component.quiz.duration = 10;
            component.quiz.description = '';

            expect(component.hasError()).toBe(QuizValidation.checkMinDescriptionLength.errorMessage);
        });

        it('should trigger too long description error', () => {
            component.quiz.title = 'TestId';
            component.quiz.duration = 10;
            component.quiz.description =
                // eslint-disable-next-line max-len
                'Cette description est très loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooongue';

            expect(component.hasError()).toBe(QuizValidation.checkMaxDescriptionLength.errorMessage);
        });

        it('should trigger missing questions error message', () => {
            component.quiz.title = 'TestId';
            component.quiz.duration = 10;
            component.quiz.description = 'Voici un quiz de test';
            component.quiz.questions = [];

            expect(component.hasError()).toBe(QuizValidation.checkRequiredQuestions.errorMessage);
        });
    });

    describe('getQuiz', () => {
        it('should update component properties with data from the service', () => {
            spyOn(quizService, 'getQuizById').and.returnValue(of(mockQuiz));
            const specifyAmountOfQuizzesSpy = spyOn(quizService, 'specifyAmountOfQuizzes');

            // eslint-disable-next-line no-underscore-dangle
            component.getQuiz(mockQuiz._id);

            expect(component.quiz.title).toEqual(mockQuiz.title);
            expect(component.quiz.duration).toEqual(mockQuiz.duration);
            expect(component.quiz.description).toEqual(mockQuiz.description);
            // eslint-disable-next-line no-underscore-dangle
            expect(component.quiz._id).toEqual(mockQuiz._id);
            expect(component.quiz.questions).toEqual(mockQuiz.questions);
            expect(component.quiz.visibility).toEqual(mockQuiz.visibility);
            expect(component.quiz.lastModification).toEqual(mockQuiz.lastModification);
            expect(component.quiz.createdAt).toEqual(mockQuiz.createdAt);

            expect(specifyAmountOfQuizzesSpy).toHaveBeenCalledWith(mockQuiz.questions.length);
        });
    });
});
