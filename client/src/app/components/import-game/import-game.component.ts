import { Component, EventEmitter, Output } from '@angular/core';
import { z } from 'zod';

@Component({
    selector: 'app-import-game',
    templateUrl: './import-game.component.html',
    styleUrls: ['./import-game.component.scss'],
})
export class ImportGameComponent {
    @Output() errorEvent = new EventEmitter<string>();

    async onFileUpload(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        const file = input.files ? input.files[0] : null;

        try {
            const errorMessage = await this.verifyFile(file);
            if (errorMessage === 'ok') {
                this.errorEvent.emit('');
            } else {
                this.errorEvent.emit(errorMessage);
            }
        } catch (error) {
            this.errorEvent.emit('Une erreur est survenue lors de la lecture du fichier!');
        }
    }

    async verifyFile(file: File | null): Promise<string> {
        return new Promise((resolve) => {
            if (!file) {
                resolve('Aucun fichier sélectionné!');
                return;
            }

            if (file.type !== 'application/json') {
                resolve("Le fichier sélectionné n'est pas un fichier JSON!");
                return;
            }

            // Commencer la lecture du fichier

            const fileReader = new FileReader();

            fileReader.onload = () => {
                const rawText = fileReader.result as string;
                try {
                    const gameFile = JSON.parse(rawText);

                    // TODO: Les changer pour les vrais types
                    const answerSchema = z.object({
                        text: z.string(),
                        correct: z.boolean(),
                    });

                    const questionSchema = z.object({
                        text: z.string(),
                        answers: z.array(answerSchema),
                    });

                    const gameSchema = z.object({
                        name: z.string(),
                        description: z.string(),
                        questions: z.array(questionSchema),
                    });

                    try {
                        const game = gameSchema.parse(gameFile);
                        // TODO: Envoie du fichier au serveur.
                        // eslint-disable-next-line no-console
                        console.log(game);
                        resolve('ok');
                    } catch (error) {
                        if (error instanceof z.ZodError) {
                            resolve('Le fichier JSON est invalide!\n' + error.issues.map((issue) => issue.path + ' ' + issue.message).join('\n'));
                        }
                    }
                } catch (error) {
                    if (error instanceof SyntaxError) {
                        resolve('La syntaxe du JSON est invalide!\n' + error.message);
                    }
                }
            };

            fileReader.readAsText(file);
        });
    }
}
