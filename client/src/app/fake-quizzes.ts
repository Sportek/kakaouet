export const WORKING_QUIZ = {
    name: 'Thomas',
    description: 'Salut, je suis thomas et je pue',
    duration: 10,
    questions: [
        {
            label: 'Quelle est la capitale de la France ?',
            type: 'QCM',
            points: 10,
            choices: [
                {
                    label: 'Paris',
                    isCorrect: true,
                },
                {
                    label: 'Londres',
                    isCorrect: false,
                },
                {
                    label: 'Berlin',
                    isCorrect: false,
                },
            ],
        },
        {
            label: "Quelle est la capitale de l'Allemagne ?",
            type: 'QCM',
            points: 10,
            choices: [
                {
                    label: 'Paris',
                    isCorrect: false,
                },
                {
                    label: 'Londres',
                    isCorrect: false,
                },
                {
                    label: 'Berlin',
                    isCorrect: true,
                },
            ],
        },
    ],
};

export const BAD_QUIZ = {
    name: 'Mon quiz',
    description: 'Description de mon quiz',
    duration: 12,
    questions: [
        {
            label: '',
            type: 'QCM',
            points: 12,
            choices: [
                {
                    label: 'Paris',
                    isCorrect: true,
                },
                {
                    label: 'Londres',
                    isCorrect: true,
                },
                {
                    label: 'Berlin',
                    isCorrect: true,
                },
            ],
        },
        {
            label: "Quelle est la capitale de l'Allemagne ?",
            type: 'QCM',
            points: 10,
            choices: [
                {
                    label: '',
                    isCorrect: true,
                },
                {
                    label: 'Londres',
                    isCorrect: false,
                },
                {
                    label: 'Berlin',
                    isCorrect: false,
                },
            ],
        },
        {
            label: "Quelle est la capitale de l'Allemagne ?",
            type: 'QRL',
            points: 10,
            choices: [
                {
                    label: 'Bobinours',
                    isCorrect: true,
                },
                {
                    label: 'Londres',
                    isCorrect: false,
                },
                {
                    label: 'Berlin',
                    isCorrect: false,
                },
            ],
        },
    ],
};
