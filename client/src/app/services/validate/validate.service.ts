import { Injectable } from '@angular/core';
import { ChoiceValidation, QuestionValidation, QuizValidation } from '@app/classes/validate';
import { ValidatedObject } from '@app/classes/validated-object';
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
