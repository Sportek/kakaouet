/* eslint-disable max-params */
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UpdateNameComponent } from '@app/components/update-name/update-name.component';
import { QuizService } from '@app/services/quiz/quiz.service';
import { ValidateService } from '@app/services/validate/validate.service';
import { Quiz } from '@common/types';

@Component({
    selector: 'app-import-game',
    templateUrl: './import-game.component.html',
    styleUrls: ['./import-game.component.scss'],
})
export class ImportGameComponent {
    constructor(
        private validateService: ValidateService,
        private quizService: QuizService,
        private snackbar: MatSnackBar,
        public dialog: MatDialog,
    ) {}

    async onFileUpload(event: Event): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            // Récupération du fichier
            const input = event.target as HTMLInputElement;
            const file = input.files ? input.files[0] : null;
            if (!file) return resolve(false);

            // Lecture du fichier
            const fileReader = new FileReader();
            fileReader.onload = async () => {
                const rawText = fileReader.result as string;
                const validatedObject = this.validateService.validateJSONQuiz(rawText);
                if (validatedObject.isValid) {
                    this.quizService.addNewQuiz(validatedObject.object).subscribe({
                        next: () => {
                            this.snackbar.open('Quiz importé avec succès', '✅');
                            return resolve(true);
                        },
                        error: (error) => {
                            if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.BadRequest) {
                                if (error.error.message === 'Quiz name has to be unique: ') {
                                    this.snackbar.open('Le nom du quiz doit être unique, vous devez changer le nom.', '❌');
                                    this.updateName(validatedObject.object);
                                    return resolve(false);
                                }
                            }
                            this.snackbar.open("Erreur lors de l'import du quiz", '❌');
                            return resolve(false);
                        },
                    });
                }
                this.snackbar.open(validatedObject.errors.join('\n'), '❌');
                return resolve(false);
            };

            fileReader.readAsText(file);
        });
    }

    updateName(quiz: Quiz) {
        this.dialog.open(UpdateNameComponent, {
            data: { quiz },
        });
    }
}
