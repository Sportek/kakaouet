import { Component, OnDestroy, OnInit } from '@angular/core';
import { OverlayService } from '@app/services/overlay/overlay.service';
import { QuestionService } from '@app/services/quiz/question.service';
import { ValidateService } from '@app/services/validate/validate.service';
import { Choice, Question } from '@common/types';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-question-overlay',
    templateUrl: './question-overlay.component.html',
    styleUrls: ['./question-overlay.component.scss'],
})
export class QuestionOverlayComponent implements OnInit, OnDestroy {
    hasQuestionId: boolean = false;
    currentQuestion: Question = this.overlayService.getBaseQuestion();

    isModifyingChoiceMap: Map<Choice, boolean> = new Map<Choice, boolean>();
    index: number;

    overlayStatus = {
        display: 'none',
    };

    private subscribers: Subscription[] = [];

    constructor(
        private questionService: QuestionService,
        private validationService: ValidateService,
        private overlayService: OverlayService,
    ) {}

    ngOnInit(): void {
        this.subscribers.push(
            this.overlayService.getCurrentQuestionObservable().subscribe({
                next: (question) => {
                    this.currentQuestion = question;
                },
            }),
        );
        this.subscribers.push(
            this.questionService.getId().subscribe({
                next: (id) => this.specifyQuestion(id),
            }),
        );
    }

    ngOnDestroy(): void {
        this.subscribers.forEach((subscriber) => subscriber.unsubscribe());
    }

    changeOverlay(): void {
        if (this.overlayStatus.display === 'flex') {
            this.overlayStatus.display = 'none';
        } else if (this.overlayStatus.display === 'none') {
            this.overlayStatus.display = 'flex';
        }
    }

    specifyQuestion(id: string): void {
        this.overlayService.specifyQuestion(id);
        this.hasQuestionId = true;
        this.changeOverlay();
    }

    changeChoiceCorrect(choice: Choice) {
        this.overlayService.changeChoiceCorrect(choice);
    }

    newQuestion(): void {
        this.overlayService.resetQuestion();
        this.hasQuestionId = false;
        this.changeOverlay();
    }

    isError(): string | null {
        if (this.currentQuestion) {
            return this.validationService.validateQuestion(this.currentQuestion).errors[0];
        }
        return null;
    }

    saveChangesToQuestion() {
        if (!this.isError()) {
            this.overlayService.submitQuestion(this.hasQuestionId);
        }
        this.changeOverlay();
    }

    modifyChoice(choice: Choice): void {
        const currentValue = this.isModifyingChoiceMap.get(choice);
        this.isModifyingChoiceMap.set(choice, !currentValue);
    }

    deleteChoice(choice: Choice): void {
        this.overlayService.deleteChoice(choice);
    }

    addChoice() {
        this.overlayService.addChoice();
    }

    moveChoiceUp(index: number): void {
        this.overlayService.moveChoiceUp(index);
    }

    moveChoiceDown(index: number): void {
        this.overlayService.moveChoiceDown(index);
    }
}
