import { Injectable } from '@angular/core';
import { Choice, Question, QuestionType, Quiz } from '@common/types';
import { ZodSchema, z } from 'zod';
import { Validate } from './validate';
import { ValidatedObject } from './validated-object';

const DESCRIPTION_MAX_LENGTH = 200;
const DESCRIPTION_MIN_LENGTH = 10;
const MAX_RESPONSE_TIME = 60;
const MIN_RESPONSE_TIME = 10;
const RESPONSE_TIME_STEP = 10;
const MAX_QUESTION_POINTS = 100;
const MIN_QUESTION_POINTS = 10;
const QUESTION_POINTS_STEP = 10;

@Injectable({
    providedIn: 'root',
})
export class ValidateService {
    validateQuiz(quiz: Quiz): ValidatedObject<Quiz> {
        const quizToValidate = ValidatedObject.fromObject<Quiz>(quiz);
        quizToValidate.check(QuizValidation.checkRequiredName);
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
                quizToValidate.errors.push(...validatedQuestion.errors.map((error) => `Question ${index}: ${error}`));
            }
        });
        return quizToValidate;
    }

    validateQuestion(question: Question): ValidatedObject<Question> {
        const questionToValidate = ValidatedObject.fromObject<Question>(question);
        questionToValidate.check(QuestionValidation.checkRequiredLabel);
        questionToValidate.check(QuestionValidation.checkMaxPoints);
        questionToValidate.check(QuestionValidation.checkMinPoints);
        questionToValidate.check(QuestionValidation.checkFormatPoints);
        questionToValidate.check(QuestionValidation.checkRequiredAnswers);
        if (questionToValidate.object.type === QuestionType.QCM) {
            questionToValidate.object.choices.forEach((choice, index) => {
                const validatedChoice = this.validateChoice(choice);
                if (!validatedChoice.isValid) {
                    questionToValidate.isValid = false;
                    questionToValidate.errors.push(...validatedChoice.errors.map((error) => `Choix ${index}: ${error}`));
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

export const choiceSchema = z
    .object({
        label: z.string(),
        isCorrect: z.boolean(),
    })
    .strip();

export const questionSchema = z
    .object({
        _id: z.string().optional(),
        label: z.string(),
        type: z.nativeEnum(QuestionType),
        points: z.number(),
        choices: z.array(choiceSchema),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
    })
    .strip();

export const quizSchema = z
    .object({
        _id: z.string().optional(),
        name: z.string(),
        description: z.string(),
        duration: z.number(),
        questions: z.array(questionSchema),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
    })
    .strip();

export namespace QuizValidation {
    export const checkRequiredName = new Validate((quiz: Quiz) => !!quiz.name.trim(), "Le nom d'un quiz est requis");

    export const checkMaxDescriptionLength = new Validate(
        (quiz: Quiz) => quiz.description.trim().length < DESCRIPTION_MAX_LENGTH,
        `La description doit faire moins de ${DESCRIPTION_MAX_LENGTH} caractères`,
    );

    export const checkMinDescriptionLength = new Validate(
        (quiz: Quiz) => quiz.description.trim().length > DESCRIPTION_MIN_LENGTH,
        `La description doit faire plus de ${DESCRIPTION_MIN_LENGTH} caractères`,
    );

    export const checkRequiredDescription = new Validate((quiz: Quiz) => !!quiz.description.trim(), "La description d'un quiz est requise");

    export const checkRequiredQuestions = new Validate((quiz: Quiz) => quiz.questions.length > 0, 'Un quiz doit avoir au moins une question');

    export const checkMaxResponseTime = new Validate(
        (quiz: Quiz) => quiz.duration <= MAX_RESPONSE_TIME,
        `Le temps de réponse doit être inférieur à ${MAX_RESPONSE_TIME} secondes`,
    );

    export const checkMinResponseTime = new Validate(
        (quiz: Quiz) => quiz.duration >= MIN_RESPONSE_TIME,
        `Le temps de réponse doit être supérieur à ${MIN_RESPONSE_TIME} secondes`,
    );

    export const checkFormatResponseTime = new Validate(
        (quiz: Quiz) => quiz.duration % RESPONSE_TIME_STEP === 0,
        `Le temps de réponse doit être un multiple de ${RESPONSE_TIME_STEP} secondes`,
    );
}

export namespace QuestionValidation {
    export const checkRequiredLabel = new Validate((question: Question) => !!question.label.trim(), "Le label d'une question est requis");

    export const checkMaxPoints = new Validate(
        (question: Question) => question.points <= MAX_QUESTION_POINTS,
        `Le nombre de points doit être inférieur à ${MAX_QUESTION_POINTS}`,
    );

    export const checkMinPoints = new Validate(
        (question: Question) => question.points >= MIN_QUESTION_POINTS,
        `Le nombre de points doit être supérieur à ${MIN_QUESTION_POINTS}`,
    );

    export const checkFormatPoints = new Validate(
        (question: Question) => question.points % QUESTION_POINTS_STEP === 0,
        `Le nombre de points doit être un multiple de ${QUESTION_POINTS_STEP}`,
    );

    export const checkRequiredAnswers = new Validate((question: Question) => {
        if (question.type !== QuestionType.QCM) return true;
        const correctChoices = question.choices.map((choice) => choice.isCorrect);
        return correctChoices.includes(true) && correctChoices.includes(false);
    }, 'Une question QCM doit avoir au moins une réponse correcte et une réponse incorrecte');
}

export namespace ChoiceValidation {
    export const checkRequiredLabel = new Validate((choice: Choice) => !!choice.label.trim(), "Le label d'une réponse est requis");
}
