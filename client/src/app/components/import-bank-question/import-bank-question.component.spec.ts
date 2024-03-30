import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionService } from '@app/services/quiz/question.service';
import { Question, QuestionType } from '@common/types';
import { of } from 'rxjs';
import { QuestionBankImportComponent } from './import-bank-question.component';

describe('QuestionBankImportComponent', () => {
    let component: QuestionBankImportComponent;
    let fixture: ComponentFixture<QuestionBankImportComponent>;
    let questionServiceSpy: jasmine.SpyObj<QuestionService>;
    const mockQuestions: Question[] = [
        {
            _id: 'q1',
            text: 'Question 1',
            points: 10,
            createdAt: new Date(),
            lastModification: new Date(),
            type: QuestionType.QCM,
            choices: [
                { _id: 1, text: 'Choice 1', isCorrect: true },
                { _id: 2, text: 'Choice 2', isCorrect: false },
            ],
        },
        {
            _id: 'q2',
            text: 'Question 2',
            points: 5,
            createdAt: new Date(),
            lastModification: new Date(),
            type: QuestionType.QRL,
        },
    ];

    beforeEach(async () => {
        questionServiceSpy = jasmine.createSpyObj('QuestionService', ['getQuestions']);
        questionServiceSpy.getQuestions.and.returnValue(of(mockQuestions));

        await TestBed.configureTestingModule({
            declarations: [QuestionBankImportComponent],
            providers: [{ provide: QuestionService, useValue: questionServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionBankImportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load questions from the bank on init', () => {
        component.ngOnInit();
        expect(questionServiceSpy.getQuestions).toHaveBeenCalled();
        expect(component.questionsFromBank).toEqual(mockQuestions);
    });

    it('should emit cancel event when cancelImportQuestions is called', () => {
        spyOn(component.cancelImport, 'emit');
        component.cancelImportQuestions();
        expect(component.cancelImport.emit).toHaveBeenCalled();
    });

    it('should toggle question selection', () => {
        const question = mockQuestions[0];
        component.toggleQuestionSelection(question);
        // eslint-disable-next-line no-underscore-dangle
        expect(component.selectedQuestions.some((q) => q._id === question._id)).toBeTrue();

        component.toggleQuestionSelection(question);
        // eslint-disable-next-line no-underscore-dangle
        expect(component.selectedQuestions.some((q) => q._id === question._id)).toBeFalse();
    });

    it('should emit selected questions and clear selection on import', () => {
        const question = mockQuestions[0];
        component.toggleQuestionSelection(question);

        spyOn(component.questionsImported, 'emit');
        component.importQuestions();

        expect(component.questionsImported.emit).toHaveBeenCalledWith([question]);
        expect(component.selectedQuestions.length).toBe(0);
    });
    it('should call importQuestions when import button is clicked', () => {
        spyOn(component, 'importQuestions');
        const button = fixture.debugElement.nativeElement.querySelector('.import-button');
        button.click();
        expect(component.importQuestions).toHaveBeenCalled();
    });
});
