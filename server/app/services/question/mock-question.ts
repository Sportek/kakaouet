import { Question } from '@app/model/database/question';

export const mockQuestions: Question[] = [
    {
        type: 'QCM',
        label: 'Who is the author of "The Lord of the Rings"?',
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
        label: 'What is the name of the hobbit who inherits the One Ring from Bilbo?',
        points: 15,
        choices: [
            { label: 'Meriadoc Brandybuck', isCorrect: false },
            { label: 'Peregrin Took', isCorrect: false },
            { label: 'Frodo Baggins', isCorrect: true },
            { label: 'Samwise Gamgee', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        label: 'Which city is the capital of Gondor?',
        points: 10,
        choices: [
            { label: 'Rivendell', isCorrect: false },
            { label: 'Minas Tirith', isCorrect: true },
            { label: 'Osgiliath', isCorrect: false },
            { label: 'Edoras', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        label: 'Who is the steward of Gondor before Aragorn becomes king?',
        points: 15,
        choices: [
            { label: 'Denethor', isCorrect: true },
            { label: 'Boromir', isCorrect: false },
            { label: 'Faramir', isCorrect: false },
            { label: 'Theoden', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        label: 'What is the elvish word for friend, used to open the Doors of Durin?',
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
        label: 'Which character said, "Not all those who wander are lost"?',
        points: 15,
        choices: [
            { label: 'Gandalf', isCorrect: false },
            { label: 'Bilbo', isCorrect: true },
            { label: 'Aragorn', isCorrect: false },
            { label: 'Legolas', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        label: 'How many Rings of Power were forged in the Second Age?',
        points: 10,
        choices: [
            { label: 'One', isCorrect: false },
            { label: 'Nine', isCorrect: false },
            { label: 'Twenty', isCorrect: true },
            { label: 'Seven', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        label: 'Which creature is Gollum originally before being corrupted by the One Ring?',
        points: 15,
        choices: [
            { label: 'Elf', isCorrect: false },
            { label: 'Hobbit', isCorrect: true },
            { label: 'Dwarf', isCorrect: false },
            { label: 'Human', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        label: 'What is the name of the wizard who leads the Fellowship of the Ring?',
        points: 10,
        choices: [
            { label: 'Saruman', isCorrect: false },
            { label: 'Gandalf', isCorrect: true },
            { label: 'Radagast', isCorrect: false },
            { label: 'Alatar', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        label: "What is the name of the spider that Frodo battles in Shelob's Lair?",
        points: 15,
        choices: [
            { label: 'Ungoliant', isCorrect: false },
            { label: 'Shelob', isCorrect: true },
            { label: 'Arachne', isCorrect: false },
            { label: 'Lobelia', isCorrect: false },
        ],
    },
];
