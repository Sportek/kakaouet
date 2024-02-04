import { AnswerState, Game, GameRole, GameType, GameUser, QuestionType, Quiz } from '@common/types';

// Création d'un quiz sur Batman
const batmanQuiz: Quiz = {
    id: 'quiz123',
    name: 'Batman Trivia',
    description: 'A quiz testing your knowledge about Batman',
    duration: 5, // en secondes
    visibility: true,
    questions: [
        {
            id: 'q1',
            label: 'Qui est le créateur de Batman?',
            points: 10,
            createdAt: new Date(),
            updatedAt: new Date(),
            type: QuestionType.QCM,
            choices: [
                { id: 1, label: 'Bob Kane', isCorrect: true },
                { id: 2, label: 'Stan Lee', isCorrect: false },
                { id: 3, label: 'Jerry Siegel', isCorrect: false },
            ],
        },
        {
            id: 'q2',
            label: 'Quel est le vrai nom de Batman?',
            points: 10,
            createdAt: new Date(),
            updatedAt: new Date(),
            type: QuestionType.QCM,
            choices: [
                {
                    id: 1,
                    label: 'Bruce Wayne',
                    isCorrect: true,
                },
                {
                    id: 2,
                    label: 'Clark Kent',
                    isCorrect: false,
                },
                {
                    id: 3,
                    label: 'Peter Parker',
                    isCorrect: false,
                },
            ],
        },
        // Plus de questions peuvent être ajoutées ici
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
};

// generate users
const users: GameUser[] = [
    {
        id: 'A1234',
        name: 'John',
        score: 0,
        answerState: AnswerState.Waiting,
        isActive: true,
        isExcluded: false,
        role: GameRole.Player,
    },
    {
        id: 'B1234',
        name: 'Jane',
        score: 0,
        answerState: AnswerState.Waiting,
        isActive: true,
        isExcluded: false,
        role: GameRole.Player,
    },
    {
        id: 'C1234',
        name: 'Jack',
        score: 0,
        answerState: AnswerState.Waiting,
        isActive: true,
        isExcluded: false,
        role: GameRole.Player,
    },
];

// Création de l'objet Game
export const batmanGame: Game = {
    id: 'game123',
    users,
    quiz: batmanQuiz,
    type: GameType.Test,
    isLocked: false,
    code: 'BAT123',
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [
        {
            content: 'Salut tout le monde',
            gameUserId: 'A1234',
            createdAt: new Date(),
        },
        {
            content: 'Bonjour',
            gameUserId: 'B1234',
            createdAt: new Date(),
        },
        {
            content: 'Hello',
            gameUserId: 'C1234',
            createdAt: new Date(),
        },
        {
            content: 'Vous faites quoi?',
            gameUserId: 'A1234',
            createdAt: new Date(),
        },
        {
            content: 'Rien',
            gameUserId: 'B1234',
            createdAt: new Date(),
        },
        {
            content:
                // eslint-disable-next-line max-len
                "Un vraiment long message pour voir comment ça s'affiche dans le chat et si ça fait un retour à la ligne. On verra bien. Génial! C'est parfait!",
            gameUserId: 'B1234',
            createdAt: new Date(),
        },
        {
            content: 'Rien',
            gameUserId: 'B1234',
            createdAt: new Date(),
        },
        {
            content: 'Rien',
            gameUserId: 'B1234',
            createdAt: new Date(),
        },
        {
            content: 'Rien',
            gameUserId: 'B1234',
            createdAt: new Date(),
        },
    ],
};
