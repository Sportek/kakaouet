/* eslint-disable max-lines */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { QuestionService } from '@app/services/quiz/question.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { QuizValidation, ValidateService } from '@app/services/validate/validate.service';
import { ValidatedObject } from '@app/services/validate/validated-object';
import { Question, QuestionType, Quiz } from '@common/types';
import { cloneDeep } from 'lodash';
import { of } from 'rxjs';
import { CreateUpdateQuizComponent } from './create-update-quiz.component';

const currentDate = new Date();

const mockQuestion1 = {
    _id: '1',
    label: 'Question 1',
    points: 10,
    createdAt: currentDate,
    updatedAt: currentDate,
    type: QuestionType.QCM,
    choices: [
        { _id: 1, label: 'Choice 1', isCorrect: true },
        { _id: 2, label: 'Choice 2', isCorrect: false },
    ],
};

const mockQuestion2 = {
    _id: '2',
    label: 'Question 2',
    points: 5,
    createdAt: new Date('2024-02-12T00:00:00'),
    updatedAt: new Date('2024-02-12T00:00:00'),
    type: QuestionType.QRL,
} as Question;

const mockQuiz: Quiz = {
    _id: 'fakeID',
    name: 'Test Quiz',
    description: "Ceci est la description d'un quiz",
    duration: 10,
    // Quiz is accessible to all users
    visibility: true,
    questions: [mockQuestion1, mockQuestion2],
    createdAt: currentDate,
    updatedAt: currentDate,
};

describe('CreateUpdateQuizComponent', () => {
    let component: CreateUpdateQuizComponent;
    let fixture: ComponentFixture<CreateUpdateQuizComponent>;
    let questionService: QuestionService;
    let quizService: QuizService;
    let validateService: ValidateService;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [CreateUpdateQuizComponent],
            imports: [HttpClientTestingModule, FormsModule],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: new Map().set('id', 'fakeID') },
                    },
                },
                { provide: MatSnackBar, useValue: jasmine.createSpyObj('MatSnackBar', ['open']) },
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

    describe('moveUp', () => {
        it('should move the question up when index is greater than 0', () => {
            component.questionsQuiz = [mockQuestion1, mockQuestion2];
            component.moveUp(1);
            expect(component.questionsQuiz).toEqual([mockQuestion2, mockQuestion1]);
        });

        it('should not move the question up when index is 0 or negative', () => {
            component.questionsQuiz = [mockQuestion1, mockQuestion2];
            component.moveUp(0);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            component.moveUp(-1);
            expect(component.questionsQuiz).toEqual([mockQuestion1, mockQuestion2]);
        });
    });

    describe('MoveDown', () => {
        it('should move the question down when index is less than the last index', () => {
            component.questionsQuiz = [mockQuestion1, mockQuestion2];
            component.moveDown(0);
            expect(component.questionsQuiz).toEqual([mockQuestion2, mockQuestion1]);
        });

        it('should not move the question down when index is the last index or greater', () => {
            component.questionsQuiz = [mockQuestion1, mockQuestion2];
            component.moveDown(1);
            component.moveDown(3);
            expect(component.questionsQuiz).toEqual([mockQuestion1, mockQuestion2]);
        });
    });

    describe('modifyQuestion', () => {
        it('should call sendId method from QuestionService with the provided id', () => {
            const sendIdSpy = spyOn(questionService, 'sendId');
            const questionId = 'fakeId';
            component.modifyQuestion(questionId);
            expect(sendIdSpy).toHaveBeenCalledWith(questionId);
        });
    });

    describe('handleQuestionsImported', () => {
        it('should add new questions to questionsQuiz and sort them by ID', () => {
            component.questionsQuiz = [mockQuestion1];

            component.handleQuestionsImported([mockQuestion2]);

            // eslint-disable-next-line no-underscore-dangle
            expect(component.questionsQuiz).toEqual([mockQuestion1, mockQuestion2].sort((a, b) => a._id.localeCompare(b._id)));

            expect(component.showImportOverlay).toBeFalse();
        });
    });

    describe('updateQuiz', () => {
        it('should update the quiz and call updateQuizById with the correct parameters', () => {
            const updatedQuiz: Quiz = cloneDeep(mockQuiz);
            updatedQuiz.name = 'Updated Quiz Name';
            updatedQuiz.updatedAt = new Date();

            component.titleQuiz = updatedQuiz.name;
            component.descriptionQuiz = updatedQuiz.description;
            component.durationQuiz = updatedQuiz.duration;
            component.quizVisibility = updatedQuiz.visibility;
            component.questionsQuiz = [mockQuestion1, mockQuestion2];

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
        it('should remove the specified question from questionsQuiz', () => {
            component.questionsQuiz = [mockQuestion1, mockQuestion2];
            component.removeQuestion(mockQuestion1);
            expect(component.questionsQuiz).not.toContain(mockQuestion1);
            expect(component.questionsQuiz).toContain(mockQuestion2);
        });

        it('should not remove the specified question from questionsQuiz', () => {
            component.questionsQuiz = [mockQuestion1, mockQuestion2];
            const questionToRemove: Question = {
                _id: '5',
                label: 'Question 5',
                points: 8,
                createdAt: new Date('2024-02-12T00:00:00'),
                updatedAt: new Date('2024-02-12T00:00:00'),
                type: QuestionType.QCM,
                choices: [
                    { _id: 1, label: 'Choice 1', isCorrect: true },
                    { _id: 2, label: 'Choice 2', isCorrect: false },
                ],
            };
            component.removeQuestion(questionToRemove);
            expect(component.questionsQuiz).toContain(mockQuestion1);
            expect(component.questionsQuiz).toContain(mockQuestion2);
        });
    });

    describe('createQuiz', () => {
        it('should create a new quiz and call addNewQuiz with the correct parameters', () => {
            const newQuiz: Quiz = {
                _id: 'fakeID',
                name: 'New Quiz Name',
                description: 'New Quiz Description',
                duration: 60,
                visibility: false,
                questions: [mockQuestion1, mockQuestion2],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            component.titleQuiz = newQuiz.name;
            component.descriptionQuiz = newQuiz.description;
            component.durationQuiz = newQuiz.duration;
            component.questionsQuiz = [mockQuestion1, mockQuestion2];

            const addNewQuizSpy = spyOn(quizService, 'addNewQuiz').and.returnValue(of(newQuiz));

            component.createQuiz();

            expect(addNewQuizSpy).toHaveBeenCalledWith({
                name: 'New Quiz Name',
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
                label: 'Question 1',
                points: 10,
                createdAt: currentDate,
                updatedAt: currentDate,
                type: QuestionType.QCM,
                choices: [
                    { _id: 1, label: 'Choice 1', isCorrect: true },
                    { _id: 2, label: 'Choice 2', isCorrect: false },
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
            component.hasId = mockQuiz._id;
            component.quiz = quizToUpdate;

            const updateQuizSpy = spyOn(component, 'updateQuiz').and.callThrough();
            component.onSubmit();
            expect(updateQuizSpy).toHaveBeenCalledWith(quizToUpdate);
        });

        it('should call createQuiz if hasId doesnt exist', () => {
            const createQuizSpy = spyOn(component, 'createQuiz').and.callThrough();
            component.onSubmit();
            expect(createQuizSpy).toHaveBeenCalled();
        });
    });

    describe('wordLength', () => {
        it('should return true if all words have length less than or equal to MaxWordLength', () => {
            component.titleQuiz = 'This is a shooooooooooooooooooooooooooooooooooooort title';
            const expectedResult = false;
            const result = component.wordLength();
            expect(result).toEqual(expectedResult);
        });

        it('should return false if any word has length greater than MaxWordLength', () => {
            component.titleQuiz = 'This is a title with a very long word length';
            const expectedResult = true;
            const result = component.wordLength();
            expect(result).toEqual(expectedResult);
        });
    });

    describe('isError', () => {
        it('should give no error message', () => {
            component.titleQuiz = 'TestId';
            component.durationQuiz = 10;
            component.descriptionQuiz = 'Voici un quiz de test';
            component.questionsQuiz = [mockQuestion1];

            expect(component.isError()).toBe(null);
        });

        it('should trigger empty title error', () => {
            component.titleQuiz = '';

            expect(component.isError()).toBe(QuizValidation.checkRequiredName.errorMessage);
        });

        it('should trigger too long title error', () => {
            component.titleQuiz =
                // eslint-disable-next-line max-len
                'Ce titre est très loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong';

            expect(component.isError()).toBe(QuizValidation.checkMaxTitleLength.errorMessage);
        });

        it('should trigger too long word in title error', () => {
            component.titleQuiz =
                // eslint-disable-next-line max-len
                'Ce mot est très looooooooooooooooooooooooooooooooooong';

            expect(component.isError()).toBe(QuizValidation.checkMaxWordLength.errorMessage);
        });

        it('should trigger too short answer duration error', () => {
            component.titleQuiz = 'TestId';
            component.durationQuiz = 1;

            expect(component.isError()).toBe(QuizValidation.checkMinResponseTime.errorMessage);
        });

        it('should trigger too long answer duration error', () => {
            component.titleQuiz = 'TestId';
            component.durationQuiz = 100;

            expect(component.isError()).toBe(QuizValidation.checkMaxResponseTime.errorMessage);
        });

        it('should trigger too short description error', () => {
            component.titleQuiz = 'TestId';
            component.durationQuiz = 10;
            component.descriptionQuiz = '';

            expect(component.isError()).toBe(QuizValidation.checkMinDescriptionLength.errorMessage);
        });

        it('should trigger too long description error', () => {
            component.titleQuiz = 'TestId';
            component.durationQuiz = 10;
            component.descriptionQuiz =
                // eslint-disable-next-line max-len
                'Cette description est très loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooongue';

            expect(component.isError()).toBe(QuizValidation.checkMaxDescriptionLength.errorMessage);
        });

        it('should trigger missing questions error message', () => {
            component.titleQuiz = 'TestId';
            component.durationQuiz = 10;
            component.descriptionQuiz = 'Voici un quiz de test';
            component.questionsQuiz = [];

            expect(component.isError()).toBe(QuizValidation.checkRequiredQuestions.errorMessage);
        });
    });

    describe('onQuestionListUpdate', () => {
        it('should add the modified question to questionsQuiz if it does not exist in the list', () => {
            component.questionsQuiz = [mockQuestion1, mockQuestion2];

            const modifiedQuestion: Question = {
                _id: '3',
                label: 'Question 3',
                points: 8,
                createdAt: new Date(),
                updatedAt: new Date(),
                type: QuestionType.QCM,
                choices: [],
            };

            component.onQuestionListUpdate(modifiedQuestion);

            expect(component.questionsQuiz.length).toEqual([mockQuestion1, mockQuestion2].length + 1);
            expect(component.questionsQuiz).toContain(modifiedQuestion);
        });

        it('should update the existing question in questionsQuiz if it exists in the list', () => {
            component.questionsQuiz = [mockQuestion1, mockQuestion2];

            const modifiedQuestion: Question = {
                _id: '1',
                label: 'Modified Question 1',
                points: 8,
                createdAt: new Date(),
                updatedAt: new Date(),
                type: QuestionType.QCM,
                choices: [],
            };

            component.onQuestionListUpdate(modifiedQuestion);

            // eslint-disable-next-line no-underscore-dangle
            const updatedQuestionIndex = component.questionsQuiz.findIndex((q) => q._id === modifiedQuestion._id);
            // eslint-disable-next-line @typescript-eslint/no-magic-numbers
            expect(updatedQuestionIndex).toBeGreaterThan(-1);
            expect(component.questionsQuiz[updatedQuestionIndex]).toEqual(modifiedQuestion);
        });
    });

    describe('getQuiz', () => {
        it('should update component properties with data from the service', () => {
            spyOn(quizService, 'getQuizById').and.returnValue(of(mockQuiz));
            const specifyAmountOfQuizzesSpy = spyOn(quizService, 'specifyAmountOfQuizzes');

            // eslint-disable-next-line no-underscore-dangle
            component.getQuiz(mockQuiz._id);

            expect(component.titleQuiz).toEqual(mockQuiz.name);
            expect(component.durationQuiz).toEqual(mockQuiz.duration);
            expect(component.descriptionQuiz).toEqual(mockQuiz.description);
            // eslint-disable-next-line no-underscore-dangle
            expect(component.hasId).toEqual(mockQuiz._id);
            expect(component.questionsQuiz).toEqual(mockQuiz.questions);
            expect(component.quizVisibility).toEqual(mockQuiz.visibility);
            expect(component.quizUpdate).toEqual(mockQuiz.updatedAt);
            expect(component.quizCreated).toEqual(mockQuiz.createdAt);

            expect(specifyAmountOfQuizzesSpy).toHaveBeenCalledWith(mockQuiz.questions.length);
        });
    });
});
