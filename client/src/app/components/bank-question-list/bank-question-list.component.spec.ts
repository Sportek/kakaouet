import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { QuestionService } from '@app/services/quiz/question.service';
import { Question, QuestionType } from '@common/types';
import { of } from 'rxjs';
import { BankQuestionListComponent } from './bank-question-list.component';

describe('BankQuestionListComponent', () => {
    let component: BankQuestionListComponent;
    let fixture: ComponentFixture<BankQuestionListComponent>;
    let questionService: QuestionService;
    let dialog: MatDialog;
    const snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BankQuestionListComponent],
            imports: [HttpClientTestingModule, MatDialogModule, MatIconModule, MatSnackBarModule],
            providers: [QuestionService, { provide: MatSnackBar, useValue: snackBarMock }],
        }).compileComponents();

        fixture = TestBed.createComponent(BankQuestionListComponent);
        component = fixture.componentInstance;
        questionService = TestBed.inject(QuestionService);
        dialog = TestBed.inject(MatDialog);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should fetch all questions on init', () => {
        const questionServiceSpy = spyOn(questionService, 'getQuestions').and.returnValue(of([]));
        component.ngOnInit();
        expect(questionServiceSpy).toHaveBeenCalled();
    });

    it('should correctly filter questions based on visibility', () => {
        component.visibility = [QuestionType.QRL];
        const questionMock: Question[] = [
            {
                _id: '1',
                text: 'Question 1',
                type: QuestionType.QRL,
                points: 10,
                createdAt: new Date(),
                lastModification: new Date(),
            },
        ];
        component.questionList = questionMock;
        fixture.detectChanges();

        expect(component.isVisible(questionMock[0])).toBeTrue();
    });

    it('should call modifyQuestionById with the correct id', () => {
        const modifySpy = spyOn(questionService, 'sendId');
        const questionId = 'testId';
        component.modifyQuestionById(questionId);
        expect(modifySpy).toHaveBeenCalledWith(questionId);
    });

    it('should not delete a question if confirmation dialog is declined', fakeAsync(() => {
        const questionMock: Question = {
            _id: '1',
            text: 'Question 1',
            type: QuestionType.QRL,
            points: 10,
            createdAt: new Date(),
            lastModification: new Date(),
        };
        component.questionList = [questionMock];

        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(false), close: null });
        spyOn(dialog, 'open').and.returnValue(dialogRefSpyObj);

        component.deleteQuestion(questionMock);
        tick();
        flush();

        fixture.detectChanges();

        expect(dialog.open).toHaveBeenCalled();
        expect(component.questionList.length).toBe(1);
    }));

    it('should return false if the question type is not in the visibility list', () => {
        component.visibility = [QuestionType.QCM];
        const questionMock: Question = {
            _id: '1',
            text: 'Question 1',
            type: QuestionType.QRL,
            points: 10,
            createdAt: new Date(),
            lastModification: new Date(),
        };

        expect(component.isVisible(questionMock)).toBeFalse();
    });

    it('should sort questions by lastModification in descending order', fakeAsync(() => {
        const questionMocks: Question[] = [
            {
                _id: '1',
                text: 'Question 1',
                type: QuestionType.QRL,
                points: 10,
                createdAt: new Date('2024-02-12T19:00:00.000Z'),
                lastModification: new Date('2024-02-12T19:05:00.000Z'),
            },
            {
                _id: '2',
                text: 'Question 2',
                type: QuestionType.QRL,
                points: 20,
                createdAt: new Date('2024-02-12T19:00:00.000Z'),
                lastModification: new Date('2024-02-12T19:10:00.000Z'),
            },
        ];
        spyOn(questionService, 'getQuestions').and.returnValue(of(questionMocks));

        component.getAllQuestions();
        flush();

        // eslint-disable-next-line no-underscore-dangle
        expect(component.questionList[0]._id).toBe('2');
        // eslint-disable-next-line no-underscore-dangle
        expect(component.questionList[1]._id).toBe('1');
    }));

    it('should handle invalid dates when sorting questions', fakeAsync(() => {
        const questionMocks: Question[] = [
            {
                _id: '1',
                text: 'Question 1',
                type: QuestionType.QRL,
                points: 10,
                createdAt: new Date('2024-02-12T19:00:00.000Z'),
                lastModification: new Date('2024-02-12T19:05:00.000Z'),
            },
            {
                _id: '2',
                text: 'Question 2',
                type: QuestionType.QRL,
                points: 20,
                createdAt: new Date('2024-02-12T19:00:00.000Z'),
                lastModification: new Date('invalid-date'),
            },
        ];
        spyOn(questionService, 'getQuestions').and.returnValue(of(questionMocks));

        component.getAllQuestions();
        flush();
        // eslint-disable-next-line no-underscore-dangle
        expect(component.questionList[0]._id).toBe('1');
        // eslint-disable-next-line no-underscore-dangle
        expect(component.questionList[1]._id).toBe('2');
    }));

    it('should delete a question if confirmation dialog is affirmed', fakeAsync(() => {
        const questionMock: Question = {
            _id: '1',
            text: 'Question 1',
            type: QuestionType.QRL,
            points: 10,
            createdAt: new Date(),
            lastModification: new Date(),
        };
        component.questionList = [
            questionMock,
            {
                _id: '2',
                text: 'Question 2',
                type: QuestionType.QRL,
                points: 20,
                createdAt: new Date(),
                lastModification: new Date(),
            },
        ];

        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null });
        spyOn(dialog, 'open').and.returnValue(dialogRefSpyObj);
        spyOn(questionService, 'deleteQuestionById').and.callFake(() => of(null));

        component.deleteQuestion(questionMock);
        tick();
        flush();

        fixture.detectChanges();

        expect(dialog.open).toHaveBeenCalled();
        expect(component.questionList.length).toBe(1);
        // eslint-disable-next-line no-underscore-dangle
        expect(component.questionList.find((q) => q._id === '1')).toBeUndefined();
        expect(questionService.deleteQuestionById).toHaveBeenCalledWith('1');
    }));
});
