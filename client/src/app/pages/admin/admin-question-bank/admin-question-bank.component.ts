import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { QuestionOverlayComponent } from '@app/components/question-overlay/question-overlay.component';
import { SelectorService } from '@app/services/selector/selector.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-admin-question-bank',
    templateUrl: './admin-question-bank.component.html',
    styleUrls: ['./admin-question-bank.component.scss'],
})
export class AdminQuestionBankComponent implements OnInit, OnDestroy {
    @ViewChild(QuestionOverlayComponent) questionOverlayComponent!: QuestionOverlayComponent;

    visibilityOptions: string[] = ['Toutes', 'Choix Multiples', 'Réponse Libre'];
    visibility: string[] = ['QCM', 'QRL'];
    private currentChoiceSubscriber: Subscription;

    constructor(private selectorService: SelectorService) {}

    ngOnInit(): void {
        this.selectorService.getCurrentChoice().subscribe({
            next: (choice) => this.changeVisibility(choice),
        });
    }

    ngOnDestroy(): void {
        if (this.currentChoiceSubscriber) this.currentChoiceSubscriber.unsubscribe();
    }

    changeVisibility(label: string) {
        if (label === 'Toutes') {
            this.visibility = ['QCM', 'QRL'];
        }
        if (label === 'Choix Multiples') {
            this.visibility = ['QCM'];
        }
        if (label === 'Réponse Libre') {
            this.visibility = ['QRL'];
        }
    }
}
