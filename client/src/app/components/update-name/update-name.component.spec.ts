import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';

import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ImportGameComponent } from '@app/components/import-game/import-game.component';
import { QuizService } from '@app/services/quiz/quiz.service';
import { WORKING_QUIZ } from '@app/services/validate/fake-quizzes';
import { Quiz } from '@common/types';
import { of, throwError } from 'rxjs';
import { UpdateNameComponent } from './update-name.component';

describe('UpdateNameComponent', () => {
    let component: UpdateNameComponent;
    let fixture: ComponentFixture<UpdateNameComponent>;
    let quizServiceMock: jasmine.SpyObj<QuizService>;
    let snackBarMock: jasmine.SpyObj<MatSnackBar>;
    let dialogRefMock: jasmine.SpyObj<MatDialogRef<ImportGameComponent>>;

    beforeEach(() => {
        quizServiceMock = jasmine.createSpyObj('QuizService', ['addNewQuiz']);
        snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
        dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
        TestBed.configureTestingModule({
            declarations: [UpdateNameComponent],
            imports: [MatDialogModule, HttpClientTestingModule, BrowserAnimationsModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { quiz: WORKING_QUIZ } },
                { provide: MatDialogRef, useValue: dialogRefMock },
                { provide: MatSnackBar, useValue: snackBarMock },
                { provide: QuizService, useValue: quizServiceMock },
            ],
        });
        fixture = TestBed.createComponent(UpdateNameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update quiz name successfully and close dialog', fakeAsync(() => {
        const newName = 'New Quiz Name';
        component.newName = newName;
        quizServiceMock.addNewQuiz.and.returnValue(of(WORKING_QUIZ as Quiz));

        component.sendNewName();
        fixture.detectChanges();
        tick();
        flush();
        expect(quizServiceMock.addNewQuiz).toHaveBeenCalledWith(jasmine.objectContaining({ name: newName }));
        expect(snackBarMock.open).toHaveBeenCalledWith('Quiz importé avec succès', '✅');
        expect(dialogRefMock.close).toHaveBeenCalled();
    }));

    it('should handle unique name violation error', () => {
        const errorResponse = new HttpErrorResponse({
            error: { message: 'Quiz name has to be unique: ' },
            status: HttpStatusCode.BadRequest,
            statusText: 'Bad Request',
        });
        quizServiceMock.addNewQuiz.and.returnValue(throwError(() => errorResponse));

        component.sendNewName();

        expect(component.newName).toEqual('');
        expect(snackBarMock.open).toHaveBeenCalledWith('Le nom du quiz doit être unique, vous devez changer le nom.', '❌');
    });
});
