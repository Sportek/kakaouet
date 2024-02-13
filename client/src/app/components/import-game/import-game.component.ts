import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuizService } from '@app/services/quiz/quiz.service';
import { ValidateService } from '@app/services/validate/validate.service';

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
                        error: () => {
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
}
