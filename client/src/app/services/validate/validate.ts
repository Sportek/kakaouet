export class Validate {
    errorMessage: string;
    callback: <T>(object: T) => boolean;
    // On s'en fout du type de l'objet dans cette classe, et on veut éviter de devoir le typer pour rien.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(callback: (object: any) => boolean, errorMessage: string) {
        this.errorMessage = errorMessage;
        this.callback = callback;
    }
}
