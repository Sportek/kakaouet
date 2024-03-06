import { QuestionDto } from '@app/model/dto/question/question.dto';

export const mockQuestions: QuestionDto[] = [
    {
        type: 'QCM',
        label: 'Qui est l\'auteur du "Seigneur des Anneaux" ?',
        points: 10,
        choices: [
            { label: 'J.K. Rowling', isCorrect: false },
            { label: 'J.R.R. Tolkien', isCorrect: true },
            { label: 'George R.R. Martin', isCorrect: false },
            { label: 'C.S. Lewis', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        label: "Quel est le nom du hobbit qui hérite de l'Anneau Unique de Bilbon ?",
        points: 20,
        choices: [
            { label: 'Meriadoc Brandebouc', isCorrect: false },
            { label: 'Peregrin Touc', isCorrect: false },
            { label: 'Frodon Sacquet', isCorrect: true },
            { label: 'Samsagace Gamegie', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        label: 'Quelle ville est la capitale du Gondor ?',
        points: 10,
        choices: [
            { label: 'Fondcombe', isCorrect: false },
            { label: 'Minas Tirith', isCorrect: true },
            { label: 'Osgiliath', isCorrect: false },
            { label: 'Edoras', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        label: "Qui est l'intendant du Gondor avant qu'Aragorn ne devienne roi ?",
        points: 20,
        choices: [
            { label: 'Denethor', isCorrect: true },
            { label: 'Boromir', isCorrect: false },
            { label: 'Faramir', isCorrect: false },
            { label: 'Théoden', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        label: 'Quel est le mot elfique pour ami, utilisé pour ouvrir les Portes de Durin ?',
        points: 10,
        choices: [
            { label: 'Mellon', isCorrect: true },
            { label: 'Elen', isCorrect: false },
            { label: 'Andúril', isCorrect: false },
            { label: 'Galadriel', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        label: 'Quel personnage a dit : "Tous ceux qui errent ne sont pas perdus" ?',
        points: 20,
        choices: [
            { label: 'Gandalf', isCorrect: false },
            { label: 'Bilbo', isCorrect: true },
            { label: 'Aragorn', isCorrect: false },
            { label: 'Legolas', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        label: "Combien d'Anneaux de Pouvoir ont été forgés au Deuxième Âge ?",
        points: 10,
        choices: [
            { label: 'Un', isCorrect: false },
            { label: 'Neuf', isCorrect: false },
            { label: 'Vingt', isCorrect: true },
            { label: 'Sept', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        label: "Quelle créature était Gollum à l'origine avant d'être corrompu par l'Anneau Unique ?",
        points: 20,
        choices: [
            { label: 'Elfe', isCorrect: false },
            { label: 'Hobbit', isCorrect: true },
            { label: 'Nain', isCorrect: false },
            { label: 'Homme', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        label: "Quel est le nom du magicien qui mène la Communauté de l'Anneau ?",
        points: 10,
        choices: [
            { label: 'Saroumane', isCorrect: false },
            { label: 'Gandalf', isCorrect: true },
            { label: 'Radagast', isCorrect: false },
            { label: 'Alatar', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        label: "Quel est le nom de l'araignée que Frodon affronte dans la tanière de Shelob ?",
        points: 20,
        choices: [
            { label: 'Ungoliant', isCorrect: false },
            { label: 'Shelob', isCorrect: true },
            { label: 'Arachne', isCorrect: false },
            { label: 'Lobelia', isCorrect: false },
        ],
    },
];
