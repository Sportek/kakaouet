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
