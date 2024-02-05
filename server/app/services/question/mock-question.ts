import { Question } from '@app/model/database/question';

export const mockQuestions: Question[] = [
    {
        type: 'QCM',
        label: 'What is the capital of France?',
        points: 10,
        choices: [
            { label: 'Paris', isCorrect: true },
            { label: 'Berlin', isCorrect: false },
            { label: 'London', isCorrect: false },
            { label: 'Madrid', isCorrect: false },
        ],
    },
    {
        type: 'QCM',
        label: 'Which programming language is known for its use in web development?',
        points: 15,
        choices: [
            { label: 'Java', isCorrect: false },
            { label: 'Python', isCorrect: false },
            { label: 'JavaScript', isCorrect: true },
            { label: 'C++', isCorrect: false },
        ],
    },
    // Add more QCM questions as needed
];
