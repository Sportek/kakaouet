import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ImportGameComponent } from './import-game.component';

describe('ImportGameComponent', () => {
    let component: ImportGameComponent;
    let fixture: ComponentFixture<ImportGameComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ImportGameComponent],
        });
        fixture = TestBed.createComponent(ImportGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // Tests générés automatiquement par ChatGPT et modifié pour être plus précis
    it('should emit error message when no file is selected', async () => {
        const answer = await component.verifyFile(null);
        expect(answer).toBe('Aucun fichier sélectionné!');
    });

    it('should emit error message when file is not JSON', async () => {
        const fakeFile = new File([''], 'test.txt', { type: 'text/plain' });
        const answer = await component.verifyFile(fakeFile);
        expect(answer).toBe("Le fichier sélectionné n'est pas un fichier JSON!");
    });

    it('should emit empty error message when file is valid JSON', async () => {
        const validJson = JSON.stringify({
            name: 'Test Game',
            description: 'Description',
            questions: [
                {
                    text: 'Question?',
                    answers: [{ text: 'Answer', correct: true }],
                },
            ],
        });
        const fakeFile = new File([validJson], 'game.json', { type: 'application/json' });
        const answer = await component.verifyFile(fakeFile);
        expect(answer).toBe('ok');
    });

    it('should emit error message for invalid JSON syntax', async () => {
        const invalidJson = '{ name: "Test Game", "description": "Description", }'; // JSON syntaxiquement invalide
        const fakeFile = new File([invalidJson], 'game.json', { type: 'application/json' });
        const answer = await component.verifyFile(fakeFile);
        expect(answer).toContain("La syntaxe du JSON est invalide!\nExpected property name or '}' in JSON at position 2");
    });

    it('should emit error message for Zod validation failure', async () => {
        const invalidJsonForSchema = JSON.stringify({ name: 'Test Game', description: 'Description' }); // Manque le champ 'questions'
        const fakeFile = new File([invalidJsonForSchema], 'game.json', { type: 'application/json' });
        const answer = await component.verifyFile(fakeFile);
        expect(answer).toBe('Le fichier JSON est invalide!\nquestions Required');
    });

    it('should handle file upload with valid JSON', () => {
        const validJson = JSON.stringify({
            name: 'Test Game',
            description: 'Description',
            questions: [
                {
                    text: 'Question?',
                    answers: [{ text: 'Answer', correct: true }],
                },
            ],
        });
        const fakeFile = new File([validJson], 'game.json', { type: 'application/json' });
        const event = { target: { files: [fakeFile] } } as unknown as Event;
        spyOn(component, 'verifyFile').and.returnValue(Promise.resolve('ok'));
        spyOn(component.errorEvent, 'emit');
        component.onFileUpload(event);
        expect(component.verifyFile).toHaveBeenCalled();
    });

    it('should emit error message when an error occurs during file reading', fakeAsync(() => {
        spyOn(component.errorEvent, 'emit');
        const fakeFile = new File([''], 'game.json', { type: 'application/json' });
        spyOn(FileReader.prototype, 'readAsText').and.callFake(() => {
            throw new Error('Fake error');
        });
        component.onFileUpload({ target: { files: [fakeFile] } } as unknown as Event);
        tick();
        expect(component.errorEvent.emit).toHaveBeenCalledWith('Une erreur est survenue lors de la lecture du fichier!');
    }));

    it('should emit error message when file validation fails', fakeAsync(() => {
        spyOn(component.errorEvent, 'emit');
        const fakeFile = new File([''], 'game.json', { type: 'application/json' });
        spyOn(component, 'verifyFile').and.returnValue(Promise.resolve('error'));
        component.onFileUpload({ target: { files: [fakeFile] } } as unknown as Event);
        tick();
        expect(component.errorEvent.emit).toHaveBeenCalledWith('error');
    }));
});
