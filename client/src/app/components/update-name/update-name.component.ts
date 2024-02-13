import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImportGameComponent } from '@app/components/import-game/import-game.component';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Quiz } from '@common/types';

@Component({
    selector: 'app-update-name',
    templateUrl: './update-name.component.html',
    styleUrls: ['./update-name.component.scss'],
})
export class UpdateNameComponent {
    newName: string = '';
    // eslint-disable-next-line max-params
    constructor(
        public dialogRef: MatDialogRef<ImportGameComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { quiz: Quiz },
        private quizService: QuizService,
        private snackbar: MatSnackBar,
    ) {}

    sendNewName() {
        this.data.quiz.name = this.newName;
        this.quizService.addNewQuiz(this.data.quiz).subscribe({
            next: () => {
                this.snackbar.open('Quiz importé avec succès', '✅');
                this.dialogRef.close();
            },
            error: (error) => {
                if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.BadRequest) {
                    if (error.error.message === 'Quiz name has to be unique: ') {
                        this.newName = '';
                        this.snackbar.open('Le nom du quiz doit être unique, vous devez changer le nom.', '❌');
                    }
                }
            },
        });
    }
}
