import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { QuizService } from '@app/services/quiz/quiz.service';
import { BaseQuestion, Choice, Question, Variables } from '@common/types';
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

    constructor(private quizService: QuizService) {}

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
        // eslint-disable-next-line no-underscore-dangle
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
        // Regular expression checking if the string has characters other than spaces
        if (!/\S/.test(this.currentQuestion.label)) {
            return 'La question doit avoir un titre';
        }
        if (this.currentQuestion.type !== 'QCM' && this.currentQuestion.type !== 'QRL') {
            return 'La question doit avoir un type';
        }
        if (this.currentQuestion.type === 'QCM' && this.choices.length < 2) {
            return 'La question doit avoir au moins deux choix';
        }
        const isModifyingChoicesArray = Array.from(this.choiceModifier.values());
        if (isModifyingChoicesArray.some((bool) => bool)) {
            return 'Tous les choix doivent être enregistrés';
        }
        if (!this.choices.some((choice) => choice.isCorrect)) {
            return 'Il doit y avoir au moins un choix correct';
        }
        if (!this.choices.some((choice) => !choice.isCorrect)) {
            return 'Il doit y avoir au moins un choix incorrect';
        }
        if (this.choices.some((choice) => !/\S/.test(choice.label))) {
            return 'Les choix ne peuvent être vides';
        }
        if (this.currentQuestion.points >= Variables.MinScore && this.currentQuestion.points <= Variables.MaxScore) {
            if (this.currentQuestion.points % Variables.MinScore === 0) {
                return null;
            } else {
                return 'Le nombre de points doit être un multiple de 10';
            }
        } else {
            return 'Le nombre de points doit être entre 10 et 100';
        }
    }

    saveChangesToQuestion() {
        if (!this.isError()) {
            if (this.currentQuestion.type === 'QCM') this.currentQuestion.choices = this.choices;
            this.questionEmitter.emit(this.currentQuestion);
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
}
