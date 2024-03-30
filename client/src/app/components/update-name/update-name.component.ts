import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ImportGameComponent } from '@app/components/import-game/import-game.component';
import { NotificationService } from '@app/services/notification/notification.service';
import { QuizService } from '@app/services/quiz/quiz.service';
import { Quiz } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-update-name',
    templateUrl: './update-name.component.html',
    styleUrls: ['./update-name.component.scss'],
})
export class UpdateNameComponent implements OnDestroy {
    newName: string = '';
    subscription: Subscription = new Subscription();

    // le constructeur n'a qu'une réelle dépendance
    // dialogRef, data et snackbar sont liés à l'utilisation de Material
    // eslint-disable-next-line max-params
    constructor(
        public dialogRef: MatDialogRef<ImportGameComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { quiz: Quiz },
        private quizService: QuizService,
        private notificationService: NotificationService,
    ) {}

    sendNewName() {
        this.data.quiz.title = this.newName;
        this.subscription.add(
            this.quizService.addNewQuiz(this.data.quiz).subscribe({
                next: () => {
                    this.notificationService.success('Le quiz a été importé avec succès');
                    this.dialogRef.close();
                },
                error: (error) => {
                    if (!(error instanceof HttpErrorResponse && error.status === HttpStatusCode.BadRequest)) return;
                    if (error.error.message === 'Quiz name has to be unique: ') {
                        this.newName = '';
                        this.notificationService.error('Le nom du quiz doit être unique, vous devez changer le nom.');
                    }
                },
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
