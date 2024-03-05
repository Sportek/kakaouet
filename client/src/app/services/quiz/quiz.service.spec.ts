import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BASE_URL } from '@app/constants';
import { QuestionFeedback, QuestionType, Quiz } from '@common/types';
import { of } from 'rxjs';
import { QuizService } from './quiz.service';

describe('QuizService', () => {
    let service: QuizService;
    let httpTestingController: HttpTestingController;
    const baseURL = 'http://localhost:3000/api/quiz';

    const mockQuiz: Quiz = {
        _id: 'jjj',
        name: 'Quiz Seigneur',
        duration: 10,
        description: 'Testez vos connaissances sur le Seigneur des Anneaux.',
        visibility: true,
        questions: [
            {
                _id: 'ddd',
                type: QuestionType.QCM,
                label: 'Qui a créé les Anneaux de Pouvoir ?',
                points: 10,
                choices: [
                    { _id: 0, label: 'Sauron', isCorrect: true },
                    { _id: 0, label: 'Gandalf', isCorrect: false },
                    { _id: 0, label: 'Elrond', isCorrect: false },
                    { _id: 0, label: 'Celebrimbor', isCorrect: false },
                ],
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [QuizService],
        });

        service = TestBed.inject(QuizService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should retrieve all quizzes', () => {
        const mockQuizzes: Quiz[] = [mockQuiz];

        service.getAllQuizzes().subscribe((quizzes) => {
            expect(quizzes).toEqual(mockQuizzes);
        });

        const req = httpTestingController.expectOne(`${BASE_URL}/quiz`);
        expect(req.request.method).toEqual('GET');
        req.flush(mockQuizzes);
    });

    it('should retrieve a quiz by id', () => {
        const quizId = '1';

        service.getQuizById(quizId).subscribe((quiz) => {
            expect(quiz).toEqual(mockQuiz);
        });

        const req = httpTestingController.expectOne(`${BASE_URL}/quiz/${quizId}`);
        expect(req.request.method).toEqual('GET');
        req.flush(mockQuiz);
    });

    it('should add a new quiz', () => {
        service.addNewQuiz(mockQuiz).subscribe((quiz) => {
            expect(quiz).toEqual(mockQuiz);
        });

        const req = httpTestingController.expectOne(`${baseURL}`);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body).toEqual(mockQuiz);
        req.flush(mockQuiz);
    });

    it('should update a quiz by id', () => {
        const quizId = '1';

        service.updateQuizById(quizId, mockQuiz).subscribe((quiz) => {
            expect(quiz).toEqual(mockQuiz);
        });

        const req = httpTestingController.expectOne(`${BASE_URL}/quiz/${quizId}`);
        expect(req.request.method).toEqual('PATCH');
        expect(req.request.body).toEqual(mockQuiz);
        req.flush(mockQuiz);
    });

    it('should delete a quiz by id', () => {
        const quizId = '1';

        service.deleteQuizById(quizId);

        const req = httpTestingController.expectOne(`${BASE_URL}/quiz/${quizId}`);
        expect(req.request.method).toEqual('DELETE');
        req.flush(null);
    });

    it('should request correct answers for a quiz question', () => {
        const quizId = 'quiz1';
        const index = 1;
        const mockCorrectAnswers: number[] = [1, 2, 3];

        service.requestCorrectAnswers(quizId, index).subscribe((answers) => {
            expect(answers).toEqual(mockCorrectAnswers);
        });

        const req = httpTestingController.expectOne(`${BASE_URL}/quiz/${quizId}?index=${index}`);
        expect(req.request.method).toEqual('GET');
        req.flush(mockCorrectAnswers);
    });

    it('should submit answers for validation and return feedback', () => {
        const quizId = 'quiz1';
        const questionId = 1;
        const answers = [1, 2];
        const mockFeedback: QuestionFeedback = {
            points: 0,
            isCorrect: true,
            correctChoicesIndices: [0],
            incorrectSelectedChoicesIndices: [1],
            correctSelectedChoicesIndices: [1],
        };

        service.correctQuizAnswers(quizId, questionId, answers).subscribe((feedback) => {
            expect(feedback).toEqual(mockFeedback);
        });

        const req = httpTestingController.expectOne(`${BASE_URL}/quiz/validate/${quizId}/${questionId}`);
        expect(req.request.method).toEqual('POST');
        expect(req.request.body).toEqual({ answers });
        req.flush(mockFeedback);
    });

    it('should update quizzes', () => {
        let updateEmitted = false;
        service.getQuizUpdates().subscribe(() => {
            updateEmitted = true;
        });

        service.updateQuizzes();
        expect(updateEmitted).toBeTrue();
    });

    it('should call next on the amountOfQuestionsSubject with the specified length', () => {
        const spy = spyOn(service as QuizService, 'specifyAmountOfQuizzes').and.callThrough();

        service.specifyAmountOfQuizzes(1);

        expect(spy).toHaveBeenCalledWith(1);
    });

    // new tests
    it('should change visibility of a quiz', () => {
        const quiz = mockQuiz;
        const originalVisibility = quiz.visibility;
        const updateQuizByIdSpy = spyOn(service, 'updateQuizById').and.returnValue(of(quiz));
        service.changeVisibility(quiz);
        // eslint-disable-next-line no-underscore-dangle
        expect(updateQuizByIdSpy).toHaveBeenCalledWith(quiz._id, quiz);
        expect(quiz.visibility).not.toBe(originalVisibility);
    });

    it('should remove a quiz', () => {
        const quiz = mockQuiz;
        const quizList = [mockQuiz];
        const deleteQuizByIdSpy = spyOn(service, 'deleteQuizById');
        service.removeQuiz(quiz, quizList);
        // eslint-disable-next-line no-underscore-dangle
        expect(deleteQuizByIdSpy).toHaveBeenCalledWith(quiz._id);
    });

    it('should generate a quiz as a file', () => {
        const createObjectURLSpy = spyOn(window.URL, 'createObjectURL');
        const createElementSpy = spyOn(document, 'createElement').and.callThrough();
        const appendChildSpy = spyOn(document.body, 'appendChild').and.callThrough();
        const clickSpy = spyOn(HTMLElement.prototype, 'click').and.callThrough();
        const revokeObjectURLSpy = spyOn(window.URL, 'revokeObjectURL').and.callThrough();

        service.generateQuizAsFile(mockQuiz);

        expect(createObjectURLSpy).toHaveBeenCalled();
        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(appendChildSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalled();
        expect(revokeObjectURLSpy).toHaveBeenCalled();
    });
});
