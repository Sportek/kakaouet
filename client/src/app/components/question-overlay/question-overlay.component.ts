import { Component, OnDestroy, OnInit } from '@angular/core';
import { OverlayService } from '@app/services/overlay/overlay.service';
import { QuestionService } from '@app/services/quiz/question.service';
import { ValidateService } from '@app/services/validate/validate.service';
import { Variables } from '@common/enum-variables';
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

    isPartOfQuiz: boolean = false;

    isActiveOverlay: boolean = false;

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
        this.isActiveOverlay = !this.isActiveOverlay;
    }

    specifyQuestion(id: string): void {
        this.overlayService.specifyQuestion(id);
        this.hasQuestionId = true;
        this.changeOverlay();
    }

    specifyQuestionObject(question: Question): void {
        this.overlayService.specifyQuestionObject(question);
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

    isModifyingChoices(): boolean {
        return Array.from(this.isModifyingChoiceMap.values()).some((bool) => bool);
    }

    isError(): string | null {
        if (this.currentQuestion) {
            if (this.isModifyingChoices()) {
                return 'Tous les choix doivent être enregistrés';
            }
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

    isModifyingChoice(choice: Choice): boolean | undefined {
        return this.isModifyingChoiceMap.get(choice);
    }

    modifyChoice(choice: Choice): void {
        this.isModifyingChoiceMap.set(choice, !this.isModifyingChoice(choice));
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

    isChoiceNotModifying(choice: Choice): boolean {
        return !this.isModifyingChoiceMap.get(choice) || !this.isModifyingChoiceMap.has(choice);
    }

    isChoiceModifying(choice: Choice): boolean {
        return this.isModifyingChoiceMap.has(choice) && this.isModifyingChoiceMap.get(choice) === true;
    }

    canAddMoreChoices(): boolean {
        return (
            this.currentQuestion.type === 'QCM' &&
            (!this.currentQuestion.choices || this.currentQuestion.choices.length < Variables.QCMMaxChoicesAmount)
        );
    }
}
