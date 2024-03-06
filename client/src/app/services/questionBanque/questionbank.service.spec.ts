import { TestBed } from '@angular/core/testing';
import { QuestionService } from '@app/services/quiz/question.service';
import { Question, QuestionType } from '@common/types';
import { of, throwError } from 'rxjs';
import { QuestionBankService } from './questionbank.service';

describe('QuestionBankService', () => {
    let service: QuestionBankService;
    let questionServiceMock: jasmine.SpyObj<QuestionService>;

    beforeEach(() => {
        questionServiceMock = jasmine.createSpyObj('QuestionService', ['getQuestions']);
        TestBed.configureTestingModule({
            providers: [QuestionBankService, { provide: QuestionService, useValue: questionServiceMock }],
        });
        service = TestBed.inject(QuestionBankService);
    });

    it('should load questions from bank successfully', (done) => {
        const mockQuestions: Question[] = [
            {
                _id: 'q1',
                label: 'What is the capital of France?',
                type: QuestionType.QCM,
                choices: [
                    { _id: 1, label: 'Paris', isCorrect: true },
                    { _id: 2, label: 'Berlin', isCorrect: false },
                    { _id: 3, label: 'Madrid', isCorrect: false },
                    { _id: 4, label: 'Lisbon', isCorrect: false },
                ],
                points: 5,
                createdAt: new Date(),
                lastModification: new Date(),
            },
        ];
        questionServiceMock.getQuestions.and.returnValue(of(mockQuestions));

        service.loadQuestionsFromBank().subscribe((questions) => {
            expect(questions.length).toBe(1);
            expect(questions).toEqual(mockQuestions);
            done();
        });
    });

    it('should handle error when loading questions from bank fails', (done) => {
        questionServiceMock.getQuestions.and.returnValue(throwError(() => new Error('Failed to load questions')));

        service.loadQuestionsFromBank().subscribe({
            next: () => {
                return;
            },
            error: (error) => {
                expect(error.message).toContain('Failed to load questions');
                done();
            },
        });
    });
    it('should toggle question selection correctly', () => {
        const question: Question = {
            _id: 'q1',
            label: 'What is the capital of France?',
            type: QuestionType.QCM,
            choices: [
                { _id: 1, label: 'Paris', isCorrect: true },
                { _id: 2, label: 'Berlin', isCorrect: false },
                { _id: 3, label: 'Madrid', isCorrect: false },
            ],
            points: 5,
            createdAt: new Date(),
            lastModification: new Date(),
        };

        service.toggleQuestionSelection(question);
        service.toggleQuestionSelection(question);

        service.getSelectedQuestionsObservable().subscribe((selectedQuestions) => {
            expect(selectedQuestions).not.toContain(question);
        });
    });

    it('should clear selected questions', () => {
        const question: Question = {
            _id: 'q1',
            label: 'What is the capital of France?',
            type: QuestionType.QCM,
            choices: [
                { _id: 1, label: 'Paris', isCorrect: true },
                { _id: 2, label: 'Berlin', isCorrect: false },
                { _id: 3, label: 'Madrid', isCorrect: false },
            ],
            points: 5,
            createdAt: new Date(),
            lastModification: new Date(),
        };
        service.toggleQuestionSelection(question);

        service.clearSelectedQuestions();
        service.getSelectedQuestionsObservable().subscribe((selectedQuestions) => {
            expect(selectedQuestions.length).toBe(0);
        });
    });
});
