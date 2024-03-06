import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Question, QuestionType, Quiz } from '@common/types';
import { Observable, of } from 'rxjs';
import { QuestionService } from './question.service';

describe('QuestionService', () => {
    let service: QuestionService;
    let httpTestingController: HttpTestingController;
    const snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    const mockQuestion: Question = {
        _id: '123',
        type: QuestionType.QCM,
        label: 'Who is the author of "The Lord of the Rings"?',
        points: 10,
        choices: [
            { _id: 0, label: 'J.K. Rowling', isCorrect: true },
            { _id: 1, label: 'J.R.R. Tolkien', isCorrect: false },
            { _id: 2, label: 'George R.R. Martin', isCorrect: false },
            { _id: 3, label: 'C.S. Lewis', isCorrect: false },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatSnackBarModule],
            providers: [QuestionService, { provide: MatSnackBar, useValue: snackBarMock }],
        }).compileComponents();

        service = TestBed.inject(QuestionService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getQuestions', () => {
        it('should get questions', () => {
            const mockQuestions: Question[] = [mockQuestion];

            service.getQuestions().subscribe((questions) => {
                expect(questions).toEqual(mockQuestions);
            });

            const req = httpTestingController.expectOne('http://localhost:3000/api/question');
            expect(req.request.method).toEqual('GET');
            req.flush(mockQuestions);
        });
    });

    describe('getQuestionsById', () => {
        it('should get a question by id', () => {
            service.getQuestionsById('1').subscribe((question) => {
                expect(question).toEqual(mockQuestion);
            });
            const req = httpTestingController.expectOne('http://localhost:3000/api/question/1');
            expect(req.request.method).toEqual('GET');
            req.flush(mockQuestion);
        });
    });

    describe('createQuestion', () => {
        it('should create a question', () => {
            service.createQuestion(mockQuestion).subscribe((createdQuestion) => {
                expect(createdQuestion).toEqual(mockQuestion);
            });

            const req = httpTestingController.expectOne('http://localhost:3000/api/question');
            expect(req.request.method).toEqual('POST');
            req.flush(mockQuestion);
        });
    });

    describe('updateQuestion', () => {
        it('should update a question', () => {
            service.updateQuestion('1', mockQuestion).subscribe((updateQuestion) => {
                expect(updateQuestion).toEqual(mockQuestion);
            });

            const req = httpTestingController.expectOne('http://localhost:3000/api/question/1');
            expect(req.request.method).toEqual('PATCH');
            req.flush(mockQuestion);
        });
    });

    describe('updateQuestions', () => {
        it('should update questions', () => {
            const result = service.updateQuestions();
            expect(result).toBeUndefined();
        });
    });

    describe('getQuestionUpdates', () => {
        it('should emit updates when questions are created', fakeAsync(() => {
            const spy = spyOn(service, 'createQuestion').and.returnValue(of(mockQuestion));
            service.createQuestion(mockQuestion);
            tick();
            service.getQuestionUpdates().subscribe(() => {
                expect(spy).toHaveBeenCalledWith(mockQuestion);
            });
            expect(spy).toHaveBeenCalled();
        }));
    });

    describe('sendId', () => {
        it('should send the provided id', (done) => {
            const mockId = '123';
            const resultObservable: Observable<string> = service.getId();
            resultObservable.subscribe((result) => {
                expect(result).toEqual(mockId);
                done();
            });
            service.sendId(mockId);
        });
    });

    describe('getId', () => {
        it('should return an observable of string', () => {
            const resultObservable: Observable<string> = service.getId();
            expect(resultObservable).toBeTruthy();
        });
    });

    describe('deleteQuestionById', () => {
        it('should send a DELETE request to the correct URL', fakeAsync(() => {
            service.deleteQuestionById('1').subscribe();
            tick();
            const req = httpTestingController.expectOne('http://localhost:3000/api/question/1');
            expect(req.request.method).toEqual('DELETE');
            req.flush(null);
        }));
    });

    describe('onQuestionListUpdate', () => {
        it('should modify question', () => {
            const quiz = {
                name: 'Thomas',
                description: 'Salut, je suis thomas et je pue',
                duration: 10,
                questions: [
                    {
                        _id: '1',
                        label: 'Quelle est la capitale de la France ?',
                        type: 'QCM',
                        points: 10,
                        choices: [
                            {
                                label: 'Paris',
                                isCorrect: true,
                            },
                            {
                                label: 'Londres',
                                isCorrect: false,
                            },
                            {
                                label: 'Berlin',
                                isCorrect: false,
                            },
                        ],
                    },
                    {
                        _id: '2',
                        label: "Quelle est la capitale de l'Allemagne ?",
                        type: 'QCM',
                        points: 10,
                        choices: [
                            {
                                label: 'Paris',
                                isCorrect: false,
                            },
                            {
                                label: 'Londres',
                                isCorrect: false,
                            },
                            {
                                label: 'Berlin',
                                isCorrect: true,
                            },
                        ],
                    },
                ],
            };
            const question = quiz.questions[0] as Question;
            const testQuiz = quiz as Quiz;
            service.onQuestionListUpdate(question, testQuiz);
            expect(quiz.questions[0] as Question).toEqual(question);
        });
    });
});
