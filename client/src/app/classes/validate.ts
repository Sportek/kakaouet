import { Variables } from '@common/enum-variables';
import { Choice, Question, QuestionType, Quiz } from '@common/types';

export class Validate {
    errorMessage: string;
    callback: <T>(object: T) => boolean;
    // Le type de l'objet n'a aucune importance, et le comportement est le même peu importe le type, donc il a besoin d'être typé comme any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(callback: (object: any) => boolean, errorMessage: string) {
        this.errorMessage = errorMessage;
        this.callback = callback;
    }
}

export namespace QuizValidation {
    export const checkRequiredName = new Validate((quiz: Quiz) => !!quiz.name.trim(), "Le nom d'un quiz est requis");

    export const checkMaxTitleLength = new Validate(
        (quiz: Quiz) => quiz.name.trim().length < Variables.MaxTitleCharacters,
        'Le titre doit avoir moins de 150 caractères',
    );

    export const checkMaxWordLength = new Validate((quiz: Quiz) => {
        let isValidated = true;
        const words = quiz.name.split(' ');
        for (const word of words) {
            if (word.length > Variables.MaxWordLength) {
                isValidated = false;
            }
        }
        return isValidated;
    }, 'Le titre ne doit pas contenir de mots plus grands que 27 caractères');

    export const checkMaxDescriptionLength = new Validate(
        (quiz: Quiz) => quiz.description.trim().length < Variables.MaxCharacters,
        `La description doit faire moins de ${Variables.MaxCharacters} caractères`,
    );

    export const checkMinDescriptionLength = new Validate(
        (quiz: Quiz) => quiz.description.trim().length > Variables.MinCharacters,
        `La description doit faire plus de ${Variables.MinCharacters} caractères`,
    );

    export const checkRequiredDescription = new Validate((quiz: Quiz) => !!quiz.description.trim(), "La description d'un quiz est requise");

    export const checkRequiredQuestions = new Validate((quiz: Quiz) => quiz.questions.length > 0, 'Un quiz doit avoir au moins une question');

    export const checkMaxResponseTime = new Validate(
        (quiz: Quiz) => quiz.duration <= Variables.MaxTime,
        `Le temps de réponse doit être inférieur à ${Variables.MaxTime} secondes`,
    );

    export const checkMinResponseTime = new Validate(
        (quiz: Quiz) => quiz.duration >= Variables.MinTime,
        `Le temps de réponse doit être supérieur à ${Variables.MinTime} secondes`,
    );
}

export namespace QuestionValidation {
    export const checkRequiredLabel = new Validate((question: Question) => !!question.label.trim(), "Le label d'une question est requis");

    export const checkRequiredType = new Validate(
        (question: Question) => question.type === QuestionType.QCM || question.type === QuestionType.QRL,
        "Le type d'une question est requis",
    );

    export const checkEnoughChoices = new Validate((question: Question) => {
        if (question.type !== QuestionType.QCM) return true;
        return question.choices.length >= Variables.QCMMinChoicesAmount && question.choices.length <= Variables.QCMMaxChoicesAmount;
    }, 'Une question QCM doit avoir de deux à quatre réponses');

    export const checkMaxPoints = new Validate(
        (question: Question) => question.points <= Variables.MaxScore,
        `Le nombre de points doit être inférieur à ${Variables.MaxScore}`,
    );

    export const checkMinPoints = new Validate(
        (question: Question) => question.points >= Variables.MinScore,
        `Le nombre de points doit être supérieur à ${Variables.MinScore}`,
    );

    export const checkFormatPoints = new Validate(
        (question: Question) => question.points % Variables.ScoreStep === 0,
        `Le nombre de points doit être un multiple de ${Variables.ScoreStep}`,
    );

    export const checkRequiredAnswers = new Validate((question: Question) => {
        if (question.type !== QuestionType.QCM) return true;
        const correctChoices = question.choices.map((choice) => choice.isCorrect);
        return correctChoices.includes(true) && correctChoices.includes(false);
    }, 'Une question QCM doit avoir au moins une réponse correcte et une réponse incorrecte');
}

export namespace ChoiceValidation {
    export const checkRequiredLabel = new Validate((choice: Choice) => {
        return !!choice.label.trim();
    }, "Le label d'une réponse est requis");
}
