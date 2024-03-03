import { TestBed } from '@angular/core/testing';

import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImportGameComponent } from '@app/components/import-game/import-game.component';
import { BAD_QUIZ, WORKING_QUIZ } from '@app/services//validate/fake-quizzes';
import { ValidateService } from '@app/services//validate/validate.service';
import { ValidatedObject } from '@app/services//validate/validated-object';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Quiz } from '@common/types';
import { FileService } from './file.service';

describe('ImportService', () => {
    let service: FileService;

    beforeEach(async () => {
        const validateServiceSpy = jasmine.createSpyObj('ValidateService', ['validateJSONQuiz']);
        const quizServiceSpy = jasmine.createSpyObj('QuizService', ['addNewQuiz']);
        const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        await TestBed.configureTestingModule({
            declarations: [ImportGameComponent],
            imports: [HttpClientTestingModule, MatDialogModule, MatIconModule],
            providers: [
                { provide: ValidateService, useValue: validateServiceSpy },
                { provide: QuizService, useValue: quizServiceSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
            ],
        }).compileComponents();
        service = TestBed.inject(FileService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should handle file upload with valid file', async () => {
        const testFile = new File([JSON.stringify(WORKING_QUIZ)], 'test.json', { type: 'application/json' });
        const event = { target: { files: [testFile] } };

        const validateService = TestBed.inject(ValidateService) as jasmine.SpyObj<ValidateService>;
        validateService.validateJSONQuiz.and.returnValue({ isValid: true, object: WORKING_QUIZ, errors: [] } as unknown as ValidatedObject<Quiz>);

        const quizService = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
        quizService.addNewQuiz.and.returnValue({
            // @ts-ignore
            subscribe: (observer: { next: () => void; error: () => void }) => {
                observer.next();
                observer.error();
            },
        });

        const fileUpload = await service.onFileUpload(event as unknown as Event);
        expect(fileUpload).toBe(true);
    });

    it('should handle file upload with invalid file', async () => {
        const testFile = new File([JSON.stringify(BAD_QUIZ)], 'test.json', { type: 'application/json' });
        const event = { target: { files: [testFile] } };

        const validateService = TestBed.inject(ValidateService) as jasmine.SpyObj<ValidateService>;
        validateService.validateJSONQuiz.and.returnValue({
            isValid: false,
            object: BAD_QUIZ,
            errors: ["Une erreur s'est produite"],
        } as unknown as ValidatedObject<Quiz>);

        const fileUpload = await service.onFileUpload(event as unknown as Event);

        expect(fileUpload).toBe(false);
    });

    it('should handle file upload with error', async () => {
        const event = { target: {} };

        const fileUpload = await service.onFileUpload(event as unknown as Event);

        expect(fileUpload).toBe(false);
    });

    it('should handle file upload with already existing name', async () => {
        const testFile = new File([JSON.stringify(WORKING_QUIZ)], 'test.json', { type: 'application/json' });
        const event = { target: { files: [testFile] } };

        const validateService = TestBed.inject(ValidateService) as jasmine.SpyObj<ValidateService>;
        validateService.validateJSONQuiz.and.returnValue({ isValid: true, object: WORKING_QUIZ, errors: [] } as unknown as ValidatedObject<Quiz>);

        const quizService = TestBed.inject(QuizService) as jasmine.SpyObj<QuizService>;
        quizService.addNewQuiz.and.returnValue({
            // @ts-ignore
            subscribe: (observer: { next: () => void; error: (error) => void }) => {
                observer.error(new HttpErrorResponse({ status: 400, error: { message: 'Quiz name has to be unique: ' } }));
            },
        });

        const fileUpload = await service.onFileUpload(event as unknown as Event);
        expect(fileUpload).toBe(false);
    });
});
