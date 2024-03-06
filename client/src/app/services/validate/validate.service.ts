import { Injectable } from '@angular/core';
import { Validate } from '@app/classes/validate';
import { ValidatedObject } from '@app/classes/validated-object';
import { Variables } from '@common/enum-variables';
import { Choice, Question, QuestionType, Quiz } from '@common/types';
import { ZodSchema, z } from 'zod';

@Injectable({
    providedIn: 'root',
})
export class ValidateService {
    validateQuiz(quiz: Quiz): ValidatedObject<Quiz> {
        const quizToValidate = ValidatedObject.fromObject<Quiz>(quiz);
        quizToValidate.check(QuizValidation.checkRequiredName);
        quizToValidate.check(QuizValidation.checkMaxTitleLength);
        quizToValidate.check(QuizValidation.checkMaxWordLength);
        quizToValidate.check(QuizValidation.checkMaxDescriptionLength);
        quizToValidate.check(QuizValidation.checkMinDescriptionLength);
        quizToValidate.check(QuizValidation.checkRequiredDescription);
        quizToValidate.check(QuizValidation.checkRequiredQuestions);
        quizToValidate.check(QuizValidation.checkMaxResponseTime);
        quizToValidate.check(QuizValidation.checkMinResponseTime);
        quizToValidate.check(QuizValidation.checkFormatResponseTime);
        quizToValidate.object.questions.forEach((question, index) => {
            const validatedQuestion = this.validateQuestion(question);
            if (!validatedQuestion.isValid) {
                quizToValidate.isValid = false;
                quizToValidate.errors.push(...validatedQuestion.errors.map((error) => `Question ${index + 1}: ${error}`));
            }
        });

        return quizToValidate;
    }

    validateQuestion(question: Question): ValidatedObject<Question> {
        const questionToValidate = ValidatedObject.fromObject<Question>(question);
        questionToValidate.check(QuestionValidation.checkRequiredLabel);
        questionToValidate.check(QuestionValidation.checkRequiredType);
        questionToValidate.check(QuestionValidation.checkMaxPoints);
        questionToValidate.check(QuestionValidation.checkEnoughChoices);
        questionToValidate.check(QuestionValidation.checkMinPoints);
        questionToValidate.check(QuestionValidation.checkFormatPoints);
        questionToValidate.check(QuestionValidation.checkRequiredAnswers);
        if (questionToValidate.object.type === QuestionType.QCM) {
            questionToValidate.object.choices.forEach((choice, index) => {
                const validatedChoice = this.validateChoice(choice);
                if (!validatedChoice.isValid) {
                    questionToValidate.isValid = false;
                    questionToValidate.errors.push(...validatedChoice.errors.map((error) => `Choix ${index + 1}: ${error}`));
                }
            });
        }
        return questionToValidate;
    }

    validateChoice(choice: Choice): ValidatedObject<Choice> {
        const choiceToValidate = ValidatedObject.fromObject<Choice>(choice);
        choiceToValidate.check(ChoiceValidation.checkRequiredLabel);
        return choiceToValidate;
    }

    validateJSON<T>(json: string, zodSchema: ZodSchema): ValidatedObject<T> {
        try {
            const object = JSON.parse(json);
            return ValidatedObject.validateFormat<T>(object, zodSchema);
        } catch (error) {
            return ValidatedObject.fromError<T>("Le fichier sélectionné n'est pas un fichier JSON valide");
        }
    }

    validateJSONQuiz(json: string): ValidatedObject<Quiz> {
        const validatedObject = this.validateJSON<Quiz>(json, quizSchema);
        if (!validatedObject.isValid) {
            return validatedObject;
        }

        return this.validateQuiz(validatedObject.object);
    }
}

const isoDateValidator = (dateString: string | undefined) => {
    if (!dateString) {
        return true;
    }
    return !isNaN(Date.parse(dateString));
};

export const choiceSchema = z
    .object({
        label: z.string(),
        isCorrect: z.boolean(),
    })
    .strip();

export const questionSchema = z
    .object({
        label: z.string(),
        type: z.nativeEnum(QuestionType),
        points: z.number(),
        choices: z.array(choiceSchema),
        createdAt: z.string().optional().refine(isoDateValidator, {
            message: 'createdAt doit être une date sous format ISO valide',
        }),
    })
    .strip();

export const quizSchema = z
    .object({
        name: z.string(),
        description: z.string(),
        duration: z.number(),
        questions: z.array(questionSchema),
        createdAt: z.string().optional().refine(isoDateValidator, {
            message: 'createdAt doit être une date sous format ISO valide',
        }),
    })
    .strip();

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

    export const checkFormatResponseTime = new Validate(
        (quiz: Quiz) => quiz.duration % Variables.TimeStep === 0,
        `Le temps de réponse doit être un multiple de ${Variables.TimeStep} secondes`,
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
