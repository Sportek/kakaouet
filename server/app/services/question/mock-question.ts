import { Question } from '@app/model/database/question';

export const mockQuestions: Question[] = [
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
    {
        type: 'QCM',
        text: 'Which programming language is known for its use in web development?',
        points: 15,
        choices: [
            { text: 'Java', isCorrect: false },
            { text: 'Python', isCorrect: false },
            { text: 'JavaScript', isCorrect: true },
            { text: 'C++', isCorrect: false },
        ],
    },
    // Add more QCM questions as needed
];
