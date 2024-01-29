export interface Games {
    name: string;
    id: number;
    time: string;
    description: string;
}

export const games = [
    {
        name: 'Jeu 1',
        id: 1,
        time: '5min 30s',
        description: 'Jeu très difficile',
    },
    {
        name: 'Jeu 2',
        id: 2,
        time: '4min 00s',
        description: 'Jeu très amusant pour les enfant !',
    },
    {
        name: 'Jeu 3',
        id: 3,
        time: '6min 20s',
        description: 'Jeu avec des questions pieges',
    },
];
