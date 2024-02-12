import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { QuestionService } from '@app/services/quiz/question.service';
import { Question, QuestionType } from '@common/types';
import { EMPTY, of } from 'rxjs';
import { BankQuestionComponent } from './bank-question.component';
describe('BankQuestionComponent', () => {
    let component: BankQuestionComponent;
    let fixture: ComponentFixture<BankQuestionComponent>;
    let questionService: QuestionService;
    let dialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BankQuestionComponent],
            imports: [HttpClientTestingModule, MatDialogModule],
            providers: [QuestionService],
        }).compileComponents();

        fixture = TestBed.createComponent(BankQuestionComponent);
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
                label: 'Question 1',
                type: QuestionType.QRL,
                points: 10,
                createdAt: new Date(),
                updatedAt: new Date(),
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

    it('should open a confirmation dialog and delete a question on confirm', fakeAsync(() => {
        const questionMock: Question = {
            _id: '1',
            label: 'Question 1',
            type: QuestionType.QRL,
            points: 10,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        component.questionList = [questionMock];

        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(true), close: null });
        spyOn(dialog, 'open').and.returnValue(dialogRefSpyObj);

        spyOn(questionService, 'deleteQuestionById').and.callFake((id: string) => {
            // eslint-disable-next-line no-underscore-dangle
            component.questionList = component.questionList.filter((q) => q._id !== id);
            return EMPTY;
        });

        component.deleteQuestion(questionMock);
        tick();

        expect(dialog.open).toHaveBeenCalled();
        expect(component.questionList.length).toBe(0);
    }));
});
