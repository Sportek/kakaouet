import { Component, OnInit } from '@angular/core';
import { QuestionService } from '@app/services/quiz/question.service';
import { ChoiceValidation, QuestionValidation, ValidateService } from '@app/services/validate/validate.service';
import { Choice, Question, QuestionType } from '@common/types';
import { cloneDeep } from 'lodash';

@Component({
    selector: 'app-question-overlay',
    templateUrl: './question-overlay.component.html',
    styleUrls: ['./question-overlay.component.scss'],
})
export class QuestionOverlayComponent implements OnInit {
    hasQuestionId: boolean = false;
    questionId: string;
    type: string = '';
    title: string = '';
    points: number;
    baseChoices: Choice[] = [
        {
            _id: 1,
            label: 'Réponse A',
            isCorrect: true,
        },
        {
            _id: 2,
            label: 'Réponse B',
            isCorrect: false,
        },
        {
            _id: 3,
            label: 'Réponse C',
            isCorrect: false,
        },
        {
            _id: 4,
            label: 'Réponse D',
            isCorrect: false,
        },
    ];
    choices: Choice[] = cloneDeep(this.baseChoices);
    choiceModifier: Map<Choice, boolean> = new Map<Choice, boolean>();
    index: number;

    overlayStatus = {
        display: 'none',
    };

    constructor(
        private questionService: QuestionService,
        private validationService: ValidateService,
    ) {}

    ngOnInit(): void {
        this.questionService.getId().subscribe({
            next: (id) => this.specifyQuestion(id),
        });
        this.resetChoicesMap();
    }

    changeOverlay(): void {
        if (this.overlayStatus.display === 'flex') {
            this.overlayStatus.display = 'none';
            this.resetChoices();
        } else if (this.overlayStatus.display === 'none') {
            this.overlayStatus.display = 'flex';
        }
    }

    specifyQuestion(id: string): void {
        this.questionService.getQuestionsById(id).subscribe({
            next: (question: Question) => {
                this.hasQuestionId = true;
                this.questionId = id;
                this.type = question.type;
                this.title = question.label;
                this.points = question.points;
                if (question.type === QuestionType.QCM) {
                    this.choices = question.choices;
                    this.resetChoicesMap();
                }
                this.changeOverlay();
            },
        });
    }

    changeChoiceCorrect(choice: Choice) {
        choice.isCorrect = !choice.isCorrect;
    }

    createQuestion(): void {
        this.hasQuestionId = false;
        this.questionId = '';
        this.type = '';
        this.title = '';
        this.points = 10;
        this.resetChoices();
        this.changeOverlay();
    }

    isError(): string | null {
        if (!QuestionValidation.checkRequiredLabel.callback({ label: this.title })) {
            return QuestionValidation.checkRequiredLabel.errorMessage;
        }

        if (!QuestionValidation.checkRequiredType.callback({ type: this.type })) {
            return QuestionValidation.checkRequiredType.errorMessage;
        }

        if (this.type === QuestionType.QCM) {
            if (!QuestionValidation.checkEnoughChoices.callback({ type: QuestionType.QCM, choices: this.choices })) {
                return QuestionValidation.checkEnoughChoices.errorMessage;
            }
            if (!QuestionValidation.checkRequiredAnswers.callback({ type: QuestionType.QCM, choices: this.choices })) {
                return QuestionValidation.checkRequiredAnswers.errorMessage;
            }
        }

        const isModifyingChoicesArray = Array.from(this.choiceModifier.values());
        if (isModifyingChoicesArray.some((bool) => bool)) {
            return 'Tous les choix doivent être enregistrés';
        }

        for (const choice of this.choices) {
            if (!ChoiceValidation.checkRequiredLabel.callback(choice)) {
                return ChoiceValidation.checkRequiredLabel.errorMessage;
            }
        }

        if (!QuestionValidation.checkMinPoints.callback({ points: this.points })) {
            return QuestionValidation.checkMinPoints.errorMessage;
        }

        if (!QuestionValidation.checkMaxPoints.callback({ points: this.points })) {
            return QuestionValidation.checkMaxPoints.errorMessage;
        }

        if (!QuestionValidation.checkFormatPoints.callback({ points: this.points })) {
            return QuestionValidation.checkFormatPoints.errorMessage;
        }

        return null;
    }

    saveChangesToQuestion() {
        if (!this.isError()) {
            let question: Partial<Question>;
            if (this.type === 'QCM') {
                question = {
                    label: this.title,
                    points: this.points,
                    type: QuestionType.QCM,
                    choices: this.choices,
                };
                const validatedQuestion = this.validationService.validateQuestion(question as Question).object;
                if (this.hasQuestionId) {
                    // eslint-disable-next-line no-underscore-dangle
                    this.questionService.updateQuestion(this.questionId, validatedQuestion).subscribe({});
                } else {
                    this.questionService.createQuestion(validatedQuestion).subscribe({});
                }
                this.changeOverlay();
            }
            if (this.type === 'QRL') {
                question = {
                    label: this.title,
                    points: this.points,
                    type: QuestionType.QRL,
                };
                const validatedQuestion = this.validationService.validateQuestion(question as Question).object;
                if (this.hasQuestionId) {
                    // eslint-disable-next-line no-underscore-dangle
                    this.questionService.updateQuestion(this.questionId, validatedQuestion).subscribe({});
                } else {
                    this.questionService.createQuestion(validatedQuestion).subscribe({});
                }
                this.changeOverlay();
            }
        }
    }

    modifyChoice(choice: Choice): void {
        const currentValue = this.choiceModifier.get(choice);
        if (currentValue !== undefined) {
            this.choiceModifier.set(choice, !currentValue);
        }
    }

    deleteChoice(choice: Choice): void {
        const choiceIndex: number = this.choices.indexOf(choice);
        if (choiceIndex >= 0 && choiceIndex < this.choices.length) {
            this.choices.splice(choiceIndex, 1);
            this.resetChoicesMap();
        }
    }

    addChoice() {
        if (this.choices.length < this.baseChoices.length) {
            const currentIndex = this.choices.length + 1;
            const newChoice: Choice = {
                _id: currentIndex,
                label: 'Ma réponse ' + currentIndex,
                isCorrect: true,
            };
            this.choices.push(newChoice);
            this.resetChoicesMap();
        }
    }

    resetChoices() {
        this.choices = cloneDeep(this.baseChoices);
        this.resetChoicesMap();
    }

    resetChoicesMap() {
        this.choiceModifier = new Map<Choice, boolean>();
        this.choices.forEach((choice) => {
            this.choiceModifier.set(choice, false);
        });
    }

    moveChoiceUp(index: number): void {
        if (index > 0 && index < this.choices.length) {
            const temp = this.choices[index];
            this.choices[index] = this.choices[index - 1];
            this.choices[index - 1] = temp;
            this.choices = [...this.choices]; // This line is to trigger change detection
        }
    }

    moveChoiceDown(index: number): void {
        if (index >= 0 && index < this.choices.length - 1) {
            const temp = this.choices[index];
            this.choices[index] = this.choices[index + 1];
            this.choices[index + 1] = temp;
            this.choices = [...this.choices]; // This line is to trigger change detection
        }
    }
}
