import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ImportGameComponent } from '@app/components/import-game/import-game.component';
import { WORKING_QUIZ } from '@app/fake-quizzes';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { ValidateService } from '@app/services/validate/validate.service';
import { Quiz } from '@common/types';
import { of, throwError } from 'rxjs';
import { UpdateNameComponent } from './update-name.component';

describe('UpdateNameComponent', () => {
    let component: UpdateNameComponent;
    let fixture: ComponentFixture<UpdateNameComponent>;
    let quizServiceMock: jasmine.SpyObj<QuizService>;
    let notificationService: jasmine.SpyObj<NotificationService>;
    let dialogRefMock: jasmine.SpyObj<MatDialogRef<ImportGameComponent>>;

    beforeEach(() => {
        quizServiceMock = jasmine.createSpyObj('QuizService', ['addNewQuiz']);
        notificationService = jasmine.createSpyObj('MatSnackBar', ['success', 'error']);
        dialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);
        TestBed.configureTestingModule({
            declarations: [UpdateNameComponent],
            imports: [
                MatDialogModule,
                HttpClientTestingModule,
                MatFormFieldModule,
                MatInputModule,
                MatSelectModule,
                BrowserAnimationsModule,
                FormsModule,
                CommonModule,
            ],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: { quiz: JSON.parse(JSON.stringify(WORKING_QUIZ)) } },
                { provide: MatDialogRef, useValue: dialogRefMock },
                { provide: NotificationService, useValue: notificationService },
                { provide: QuizService, useValue: quizServiceMock },
                { provide: ValidateService, useValue: {} },
            ],
        });
        fixture = TestBed.createComponent(UpdateNameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        quizServiceMock.addNewQuiz.calls.reset();
        notificationService.success.calls.reset();
        notificationService.error.calls.reset();
        dialogRefMock.close.calls.reset();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update quiz name successfully and close dialog', fakeAsync(() => {
        const newName = 'New Quiz Name';
        component.newName = newName;
        quizServiceMock.addNewQuiz.and.returnValue(of(JSON.parse(JSON.stringify(WORKING_QUIZ)) as Quiz));

        component.sendNewName();
        fixture.detectChanges();
        expect(quizServiceMock.addNewQuiz).toHaveBeenCalledWith(jasmine.objectContaining({ name: newName }));
        expect(notificationService.success).toHaveBeenCalledWith('Le quiz a été importé avec succès');
        expect(dialogRefMock.close).toHaveBeenCalled();
    }));

    it('should handle unique name violation error', () => {
        const errorResponse = new HttpErrorResponse({
            error: { message: 'Quiz name has to be unique: ' },
            status: 400,
            statusText: 'Bad Request',
        });

        quizServiceMock.addNewQuiz.and.returnValue(throwError(() => errorResponse));

        component.sendNewName();
        expect(notificationService.error).toHaveBeenCalledWith('Le nom du quiz doit être unique, vous devez changer le nom.');
    });

    it('should unsubscribe on destroy', () => {
        spyOn(component.subscription, 'unsubscribe');
        component.ngOnDestroy();
        expect(component.subscription.unsubscribe).toHaveBeenCalled();
    });
});
