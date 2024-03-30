export const WORKING_QUIZ = {
    title: 'Thomas',
    description: 'Salut, je suis thomas et je pue',
    duration: 10,
    questions: [
        {
            text: 'Quelle est la capitale de la France ?',
            type: 'QCM',
            points: 10,
            choices: [
                {
                    text: 'Paris',
                    isCorrect: true,
                },
                {
                    text: 'Londres',
                    isCorrect: false,
                },
                {
                    text: 'Berlin',
                    isCorrect: false,
                },
            ],
        },
        {
            text: "Quelle est la capitale de l'Allemagne ?",
            type: 'QCM',
            points: 10,
            choices: [
                {
                    text: 'Paris',
                    isCorrect: false,
                },
                {
                    text: 'Londres',
                    isCorrect: false,
                },
                {
                    text: 'Berlin',
                    isCorrect: true,
                },
            ],
        },
    ],
};

export const BAD_QUIZ = {
    title: 'Mon quiz',
    description: 'Description de mon quiz',
    duration: 12,
    questions: [
        {
            text: '',
            type: 'QCM',
            points: 12,
            choices: [
                {
                    text: 'Paris',
                    isCorrect: true,
                },
                {
                    text: 'Londres',
                    isCorrect: true,
                },
                {
                    text: 'Berlin',
                    isCorrect: true,
                },
            ],
        },
        {
            text: "Quelle est la capitale de l'Allemagne ?",
            type: 'QCM',
            points: 10,
            choices: [
                {
                    text: '',
                    isCorrect: true,
                },
                {
                    text: 'Londres',
                    isCorrect: false,
                },
                {
                    text: 'Berlin',
                    isCorrect: false,
                },
            ],
        },
        {
            text: "Quelle est la capitale de l'Allemagne ?",
            type: 'QRL',
            points: 10,
            choices: [
                {
                    text: 'Bobinours',
                    isCorrect: true,
                },
                {
                    text: 'Londres',
                    isCorrect: false,
                },
                {
                    text: 'Berlin',
                    isCorrect: false,
                },
            ],
        },
    ],
};
