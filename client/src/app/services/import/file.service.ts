import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UpdateNameComponent } from '@app/components/update-name/update-name.component';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { ValidateService } from '@app/services/validate/validate.service';
import { Quiz } from '@common/types';

@Injectable({
    providedIn: 'root',
})
export class FileService {
    // eslint-disable-next-line max-params -- Nécessite absolument tous les paramètres
    constructor(
        private validateService: ValidateService,
        private quizService: QuizService,
        private notificationService: NotificationService,
        private dialog: MatDialog,
    ) {}

    async onFileUpload(event: Event): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            const input = event.target as HTMLInputElement;
            const file = input.files ? input.files[0] : null;
            if (!file) return resolve(false);
            const fileReader = new FileReader();
            fileReader.onload = async () => {
                this.import(fileReader, resolve);
            };
            fileReader.readAsText(file);
        });
    }

    private updateName(quiz: Quiz) {
        this.dialog.open(UpdateNameComponent, {
            data: { quiz },
        });
    }

    private async import(fileReader: FileReader, resolve: (value: boolean) => void) {
        const rawText = fileReader.result as string;
        const validatedObject = this.validateService.validateJSONQuiz(rawText);
        if (validatedObject.isValid) {
            this.quizService.addNewQuiz(validatedObject.object).subscribe({
                next: () => {
                    this.notificationService.success('Quiz importé avec succès');
                    return resolve(true);
                },
                error: (error) => {
                    this.manageError(error, validatedObject, resolve);
                },
            });
        }
        this.notificationService.error(validatedObject.errors.join('\n'));
        return resolve(false);
    }

    private manageError(error: HttpErrorResponse, validatedObject: { isValid: boolean; object: Quiz }, resolve: (value: boolean) => void) {
        if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.BadRequest) {
            if (error.error.message === 'Quiz name has to be unique: ') {
                this.notificationService.error('Le nom du quiz doit être unique, vous devez changer le nom.');
                this.updateName(validatedObject.object);
                return resolve(false);
            }
        }
        this.notificationService.error("Erreur lors de l'import du quiz");
        return resolve(false);
    }
}
