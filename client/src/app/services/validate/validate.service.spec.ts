import { TestBed } from '@angular/core/testing';

import { BAD_QUIZ, WORKING_QUIZ } from '@app/fake-quizzes';
import { QuestionType, Quiz } from '@common/types';
import { ValidateService } from './validate.service';

describe('ValidateService', () => {
    let service: ValidateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ValidateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should validate quiz correctly', () => {
        const validate = service.validateQuiz(WORKING_QUIZ as Quiz);
        expect(validate.isValid).toBe(true);
    });

    it('should not validate quiz correctly', () => {
        const validate = service.validateQuiz(BAD_QUIZ as Quiz);
        const expectedErrors = [
            'Le temps de réponse doit être un multiple de 10 secondes',
            "Question 1: Le label d'une question est requis",
            'Question 1: Le nombre de points doit être un multiple de 10',
            'Question 1: Une question QCM doit avoir au moins une réponse correcte et une réponse incorrecte',
            "Question 2: Choix 1: Le label d'une réponse est requis",
        ];
        expect(validate.errors).toEqual(expectedErrors);
    });

    it('should trim quiz correctly', () => {
        const validate = service.validateJSONQuiz(JSON.stringify({ ...WORKING_QUIZ, bobinours: 'boubi' }));

        expect(validate.isValid).toBe(true);
        expect(validate.object).toEqual(WORKING_QUIZ as Quiz);
    });

    it('incorrect json file', () => {
        const validate = service.validateJSONQuiz('{ bobi');
        expect(validate.isValid).toBe(false);
        expect(validate.errors).toEqual(["Le fichier sélectionné n'est pas un fichier JSON valide"]);
    });

    it('should have a description', () => {
        const validate = service.validateJSONQuiz(JSON.stringify({ ...WORKING_QUIZ, description: undefined }));
        expect(validate.isValid).toBe(false);
    });

    it('should validate quiz title length correctly', () => {
        const quizWithLongWord: Quiz = {
            _id: '1',
            name: 'ThisIsAVeryLongWordThatExceedsTheLimit',
            description: 'Valid description',
            duration: 30,
            questions: [
                {
                    _id: '1',
                    label: 'Question 1',
                    type: QuestionType.QCM,
                    points: 20,
                    choices: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ],
            visibility: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const validate = service.validateQuiz(quizWithLongWord);

        expect(validate.isValid).toBe(false);
        expect(validate.errors).toContain('Le titre ne doit pas contenir de mots plus grands que 27 caractères');
    });
});
