import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UpdateNameComponent } from '@app/components/update-name/update-name.component';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { ValidateService } from '@app/services/validate/validate.service';
import { Quiz } from '@common/types';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class FileService {
    constructor(
        private validateService: ValidateService,
        private quizService: QuizService,
        private notificationService: NotificationService,
        private dialog: MatDialog,
    ) {}

    onFileUpload(event: Event): Observable<boolean> {
        const input = event.target as HTMLInputElement;
        const file = input.files ? input.files[0] : null;
        
        if (!file) {
            return of(false);
        }

        return this.readFileAsText(file).pipe(
            switchMap((rawText) => {
                const validatedObject = this.validateService.validateJSONQuiz(rawText);
                if (validatedObject.isValid) {
                    return this.quizService.addNewQuiz(validatedObject.object).pipe(
                        switchMap(() => {
                            this.notificationService.success('Quiz importé avec succès');
                            return of(true);
                        }),
                        catchError((error) => {
                            if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.BadRequest) {
                                if (error.error.message === 'Quiz name has to be unique: ') {
                                    this.notificationService.error(
                                        'Le nom du quiz doit être unique, vous devez changer le nom.'
                                    );
                                    this.updateName(validatedObject.object);
                                    return of(false);
                                }
                            }
                            this.notificationService.error("Erreur lors de l'import du quiz");
                            return of(false);
                        })
                    );
                } else {
                    this.notificationService.error(validatedObject.errors.join('\n'));
                    return of(false);
                }
            })
        );
    }

    private readFileAsText(file: File): Observable<string> {
        return new Observable<string>((observer) => {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                observer.next(fileReader.result as string);
                observer.complete();
            };
            fileReader.readAsText(file);
        });
    }

    private updateName(quiz: Quiz): void {
        this.dialog.open(UpdateNameComponent, {
            data: { quiz },
        });
    }
}
