import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuizService } from '@app/services/quiz/quiz.service';
import { BAD_QUIZ, WORKING_QUIZ } from '@app/services/validate/fake-quizzes';
import { ValidateService } from '@app/services/validate/validate.service';
import { ValidatedObject } from '@app/services/validate/validated-object';
import { Quiz } from '@common/types';
import { ImportGameComponent } from './import-game.component';

describe('ImportGameComponent', () => {
    let component: ImportGameComponent;
    let fixture: ComponentFixture<ImportGameComponent>;

    beforeEach(async () => {
        const validateServiceSpy = jasmine.createSpyObj('ValidateService', ['validateJSONQuiz']);
        const quizServiceSpy = jasmine.createSpyObj('QuizService', ['addNewQuiz']);
        const snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

        await TestBed.configureTestingModule({
            declarations: [ImportGameComponent],
            imports: [HttpClientTestingModule],
            providers: [
                { provide: ValidateService, useValue: validateServiceSpy },
                { provide: QuizService, useValue: quizServiceSpy },
                { provide: MatSnackBar, useValue: snackBarSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ImportGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
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

        const fileUpload = await component.onFileUpload(event as unknown as Event);

        fixture.detectChanges(); // Permet de réagir aux changements déclenchés par les promesses

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

        const fileUpload = await component.onFileUpload(event as unknown as Event);

        fixture.detectChanges(); // Permet de réagir aux changements déclenchés par les promesses

        expect(fileUpload).toBe(false);
    });

    it('should handle file upload with error', async () => {
        const event = { target: {} };

        const fileUpload = await component.onFileUpload(event as unknown as Event);

        expect(fileUpload).toBe(false);
    });
});
