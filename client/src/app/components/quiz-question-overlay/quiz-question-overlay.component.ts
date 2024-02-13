import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { QuizService } from '@app/services/quiz/quiz.service';
import { ChoiceValidation, QuestionValidation, ValidateService } from '@app/services/validate/validate.service';
import { BaseQuestion, Choice, Question, QuestionType, Variables } from '@common/types';
import { cloneDeep } from 'lodash';

@Component({
    selector: 'app-quiz-question-overlay',
    templateUrl: './quiz-question-overlay.component.html',
    styleUrls: ['./quiz-question-overlay.component.scss'],
})
export class QuizQuestionOverlayComponent implements OnInit {
    @Output() questionEmitter = new EventEmitter<Question>();
    hasQuestionId: boolean = false;
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
    baseQuestion: BaseQuestion = {
        _id: '',
        label: '',
        points: Variables.MinScore,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    currentQuestion: Question = cloneDeep(this.baseQuestion as Question);
    choiceModifier: Map<Choice, boolean> = new Map<Choice, boolean>();
    index: number;
    idTracker: number = 0;

    overlayStatus = {
        display: 'none',
    };

    constructor(
        private quizService: QuizService,
        private validationService: ValidateService,
    ) {}

    ngOnInit(): void {
        this.resetChoicesMap();
        this.quizService.getAmountOfQuizzes().subscribe({
            next: (length) => {
                this.idTracker = length;
            },
        });
    }

    changeOverlay(): void {
        if (this.overlayStatus.display === 'flex') {
            this.overlayStatus.display = 'none';
        } else if (this.overlayStatus.display === 'none') {
            this.overlayStatus.display = 'flex';
        }
    }

    specifyQuestion(question: Question): void {
        this.hasQuestionId = true;
        this.currentQuestion = question;
        if (this.currentQuestion.type === 'QCM') {
            this.choices = this.currentQuestion.choices;
            this.resetChoicesMap();
        }
        this.changeOverlay();
    }

    changeChoiceCorrect(choice: Choice) {
        choice.isCorrect = !choice.isCorrect;
    }

    createQuestion(): void {
        this.hasQuestionId = false;
        this.currentQuestion = cloneDeep(this.baseQuestion as Question);
        this.idTracker++;
        // eslint-disable-next-line no-underscore-dangle
        this.currentQuestion._id = this.idTracker.toString();
        this.resetChoices();
        this.changeOverlay();
    }

    isError(): string | null {
        if (!QuestionValidation.checkRequiredLabel.callback({ label: this.currentQuestion.label })) {
            return QuestionValidation.checkRequiredLabel.errorMessage;
        }

        if (!QuestionValidation.checkRequiredType.callback({ type: this.currentQuestion.type })) {
            return QuestionValidation.checkRequiredType.errorMessage;
        }

        if (this.currentQuestion.type === QuestionType.QCM) {
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

        if (!QuestionValidation.checkMinPoints.callback({ points: this.currentQuestion.points })) {
            return QuestionValidation.checkMinPoints.errorMessage;
        }

        if (!QuestionValidation.checkMaxPoints.callback({ points: this.currentQuestion.points })) {
            return QuestionValidation.checkMaxPoints.errorMessage;
        }

        if (!QuestionValidation.checkFormatPoints.callback({ points: this.currentQuestion.points })) {
            return QuestionValidation.checkFormatPoints.errorMessage;
        }

        return null;
    }

    saveChangesToQuestion() {
        if (!this.isError()) {
            if (this.currentQuestion.type === 'QCM') this.currentQuestion.choices = this.choices;
            const validatedQuestion = this.validationService.validateQuestion(this.currentQuestion).object;
            this.questionEmitter.emit(validatedQuestion);
            this.resetChoices();
            this.changeOverlay();
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
            this.choices = [...this.choices];
        }
    }

    moveChoiceDown(index: number): void {
        if (index >= 0 && index < this.choices.length - 1) {
            const temp = this.choices[index];
            this.choices[index] = this.choices[index + 1];
            this.choices[index + 1] = temp;
            this.choices = [...this.choices];
        }
    }
}
