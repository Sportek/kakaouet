import { QuizDto } from '@app/model/dto/quiz/quiz.dto';

export const mockQuizTable: QuizDto[] = [
    {
        name: 'Quiz Seigneur',
        duration: 10,
        description: 'Testez vos connaissances sur le Seigneur des Anneaux.',
        visibility: true,
        questions: [
            {
                type: 'QCM',
                label: 'Qui a créé les Anneaux de Pouvoir ?',
                points: 10,
                choices: [
                    { label: 'Sauron', isCorrect: true },
                    { label: 'Gandalf', isCorrect: false },
                    { label: 'Elrond', isCorrect: false },
                    { label: 'Celebrimbor', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                label: "Qui est le père d'Aragorn ?",
                points: 10,
                choices: [
                    { label: 'Elendil', isCorrect: false },
                    { label: 'Isildur', isCorrect: false },
                    { label: 'Arathorn', isCorrect: true },
                    { label: 'Denethor', isCorrect: false },
                ],
            },
        ],
    },
    {
        name: 'Quiz Seigneur des Anneaux - Partie 2',
        duration: 10,
        description: 'Continuez à explorer votre savoir sur le monde de Tolkien.',
        visibility: true,
        questions: [
            {
                type: 'QCM',
                label: 'Quel est le vrai nom de Gollum ?',
                points: 10,
                choices: [
                    { label: 'Smeagol', isCorrect: true },
                    { label: 'Deagol', isCorrect: false },
                    { label: 'Frodo', isCorrect: false },
                    { label: 'Bilbo', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                label: 'Quelle créature est Shelob ?',
                points: 10,
                choices: [
                    { label: 'Un dragon', isCorrect: false },
                    { label: 'Un balrog', isCorrect: false },
                    { label: 'Une araignée géante', isCorrect: true },
                    { label: 'Un troll', isCorrect: false },
                ],
            },
        ],
    },
];
