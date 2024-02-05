import { Component, ViewChild } from '@angular/core';
import { QuestionOverlayComponent } from '@app/components/question-overlay/question-overlay.component';

@Component({
    selector: 'app-admin-question-bank',
    templateUrl: './admin-question-bank.component.html',
    styleUrls: ['./admin-question-bank.component.scss'],
})
export class AdminQuestionBankComponent {
    @ViewChild(QuestionOverlayComponent) questionOverlayComponent!: QuestionOverlayComponent;
}
