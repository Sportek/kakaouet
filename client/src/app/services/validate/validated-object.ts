import { ZodError, ZodSchema } from 'zod';
import { Validate } from './validate';

export class ValidatedObject<T> {
    isValid: boolean;
    object: T = {} as T;
    errors: string[] = [];
    private constructor(isValid: boolean, object?: T, errors?: string[]) {
        this.isValid = isValid;
        this.object = object ?? ({} as T);
        this.errors = errors ?? [];
    }

    // Utile pour vérifier si un objet est correctement formé, avec les éléments qu'on souhaite avoir.
    static validateFormat<T>(objet: unknown, schema: ZodSchema): ValidatedObject<T> {
        try {
            const object = schema.parse(objet);
            return new ValidatedObject<T>(true, object);
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
                return new ValidatedObject<T>(false, undefined, errors);
            }

            return new ValidatedObject<T>(false, undefined, ['Erreur inattendue lors de la validation.']);
        }
    }

    // Permet de récupérer un validatedObject à partir d'un objet déjà existant.
    static fromObject<T>(object: T): ValidatedObject<T> {
        return new ValidatedObject<T>(true, object);
    }

    static fromError<T>(error: string): ValidatedObject<T> {
        return new ValidatedObject<T>(false, undefined, [error]);
    }

    // Permet de valider des chaines d'exécutions, en vérifiant que chaque étape est valide.
    // Sauvegarde tous les messages d'erreur.
    check(validate: Validate): ValidatedObject<T> {
        if (!validate.callback(this.object)) {
            this.errors?.push(validate.errorMessage);
            this.isValid = false;
        }
        return this;
    }
}
