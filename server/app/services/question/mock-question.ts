import { QuestionDto } from '@app/model/dto/question/question.dto';

export const mockQuestions: QuestionDto[] = [
    {
        type: 'QCM',
        text: 'Qui est l\'auteur du "Seigneur des Anneaux" ?',
        points: 10,
        choices: [
            { text: 'J.K. Rowling', isCorrect: false },
            { text: 'J.R.R. Tolkien', isCorrect: true },
            { text: 'George R.R. Martin', isCorrect: false },
            { text: 'C.S. Lewis', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        text: "Quel est le nom du hobbit qui hérite de l'Anneau Unique de Bilbon ?",
        points: 20,
        choices: [
            { text: 'Meriadoc Brandebouc', isCorrect: false },
            { text: 'Peregrin Touc', isCorrect: false },
            { text: 'Frodon Sacquet', isCorrect: true },
            { text: 'Samsagace Gamegie', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        text: 'Quelle ville est la capitale du Gondor ?',
        points: 10,
        choices: [
            { text: 'Fondcombe', isCorrect: false },
            { text: 'Minas Tirith', isCorrect: true },
            { text: 'Osgiliath', isCorrect: false },
            { text: 'Edoras', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        text: "Qui est l'intendant du Gondor avant qu'Aragorn ne devienne roi ?",
        points: 20,
        choices: [
            { text: 'Denethor', isCorrect: true },
            { text: 'Boromir', isCorrect: false },
            { text: 'Faramir', isCorrect: false },
            { text: 'Théoden', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        text: 'Quel est le mot elfique pour ami, utilisé pour ouvrir les Portes de Durin ?',
        points: 10,
        choices: [
            { text: 'Mellon', isCorrect: true },
            { text: 'Elen', isCorrect: false },
            { text: 'Andúril', isCorrect: false },
            { text: 'Galadriel', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        text: 'Quel personnage a dit : "Tous ceux qui errent ne sont pas perdus" ?',
        points: 20,
        choices: [
            { text: 'Gandalf', isCorrect: false },
            { text: 'Bilbo', isCorrect: true },
            { text: 'Aragorn', isCorrect: false },
            { text: 'Legolas', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        text: "Combien d'Anneaux de Pouvoir ont été forgés au Deuxième Âge ?",
        points: 10,
        choices: [
            { text: 'Un', isCorrect: false },
            { text: 'Neuf', isCorrect: false },
            { text: 'Vingt', isCorrect: true },
            { text: 'Sept', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        text: "Quelle créature était Gollum à l'origine avant d'être corrompu par l'Anneau Unique ?",
        points: 20,
        choices: [
            { text: 'Elfe', isCorrect: false },
            { text: 'Hobbit', isCorrect: true },
            { text: 'Nain', isCorrect: false },
            { text: 'Homme', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        text: "Quel est le nom du magicien qui mène la Communauté de l'Anneau ?",
        points: 10,
        choices: [
            { text: 'Saroumane', isCorrect: false },
            { text: 'Gandalf', isCorrect: true },
            { text: 'Radagast', isCorrect: false },
            { text: 'Alatar', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        text: "Quel est le nom de l'araignée que Frodon affronte dans la tanière de Shelob ?",
        points: 20,
        choices: [
            { text: 'Ungoliant', isCorrect: false },
            { text: 'Shelob', isCorrect: true },
            { text: 'Arachne', isCorrect: false },
            { text: 'Lobelia', isCorrect: false },
        ],
    },
    {
        type: 'QRL',
        text: 'Japon-Chine : concurrences régionales, ambitions mondiales ?',
        points: 10,
    },
];
