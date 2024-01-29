import { Quiz } from '@app/model/database/quiz';

export const mockQuizTable: Quiz[] = [
    {
        name: 'Quiz 1',
        duration: 60,
        description: 'This is the description of question 1',
        visibility: true,
        questions: [
            {
                type: 'QCM',
                text: 'What is the capital of France?',
                points: 10,
                choices: [
                    { text: 'Paris', isCorrect: true },
                    { text: 'Berlin', isCorrect: false },
                    { text: 'London', isCorrect: false },
                    { text: 'Madrid', isCorrect: false },
                ],
            },
        ],
    },
    {
        name: 'Quiz 2',
        duration: 60,
        description: 'This is the description of question 2',
        visibility: true,
        questions: [
            {
                type: 'QCM',
                text: 'What is the capital of France?',
                points: 10,
                choices: [
                    { text: 'Paris', isCorrect: true },
                    { text: 'Berlin', isCorrect: false },
                    { text: 'London', isCorrect: false },
                    { text: 'Madrid', isCorrect: false },
                ],
            },
        ],
    },
];
