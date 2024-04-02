import { QuizDto } from '@app/model/dto/quiz/quiz.dto';
export const cinq = 5;
export const unDemi = 0.5;

export const mockQuizTable: QuizDto[] = [
    {
        title: 'Quiz Héros de la Terre du Milieu',
        duration: 10,
        description: 'Découvrez les héros emblématiques de la saga.',
        visibility: true,
        questions: [
            {
                type: 'QCM',
                text: 'Quel est le titre donné à Gandalf après sa résurrection ?',
                points: 10,
                choices: [
                    { text: 'Gandalf le Gris', isCorrect: false },
                    { text: 'Gandalf le Blanc', isCorrect: true },
                    { text: 'Gandalf le Noir', isCorrect: false },
                    { text: 'Gandalf le Rouge', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: 'Quelle est la race de Legolas ?',
                points: 10,
                choices: [
                    { text: 'Nain', isCorrect: false },
                    { text: 'Elfe', isCorrect: true },
                    { text: 'Homme', isCorrect: false },
                    { text: 'Hobbit', isCorrect: false },
                ],
            },
        ],
    },
    {
        title: 'Quiz Batailles Épiques',
        duration: 10,
        description: 'Testez vos connaissances sur les grandes batailles.',
        visibility: true,
        questions: [
            {
                type: 'QCM',
                text: 'Où se déroule la Bataille de la Porte Noire ?',
                points: 10,
                choices: [
                    { text: 'Gondor', isCorrect: false },
                    { text: 'Mordor', isCorrect: true },
                    { text: 'Rohan', isCorrect: false },
                    { text: 'Isengard', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: 'Qui commande les armées du Gondor lors de la Bataille des Champs du Pelennor ?',
                points: 10,
                choices: [
                    { text: 'Théoden', isCorrect: false },
                    { text: 'Aragorn', isCorrect: false },
                    { text: 'Denethor', isCorrect: false },
                    { text: 'Gandalf', isCorrect: true },
                ],
            },
        ],
    },
    {
        title: 'Quiz Artefacts Magiques',
        duration: 10,
        description: 'Connaissez-vous les objets magiques ?',
        visibility: true,
        questions: [
            {
                type: 'QCM',
                text: 'Quel anneau Bilbo trouve-t-il dans la grotte de Gollum ?',
                points: 10,
                choices: [
                    { text: "L'Anneau Unique", isCorrect: true },
                    { text: "L'Anneau de Pouvoir de Nenya", isCorrect: false },
                    { text: "L'Anneau de Barahir", isCorrect: false },
                    { text: "L'Anneau de Durin", isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: "Quel est l'objet qui permet à Frodon de se rendre invisible ?",
                points: 10,
                choices: [
                    { text: 'Le manteau elfique', isCorrect: false },
                    { text: "L'épée Sting", isCorrect: false },
                    { text: "L'Anneau Unique", isCorrect: true },
                    { text: "La lumière d'Eärendil", isCorrect: false },
                ],
            },
        ],
    },
    {
        title: 'Quiz Ennemis du Tiers Âge',
        duration: 10,
        description: 'Les forces obscures contre lesquelles les héros luttent.',
        visibility: true,
        questions: [
            {
                type: 'QCM',
                text: 'Qui est le chef des Nazgûl ?',
                points: 10,
                choices: [
                    { text: "Le Roi-Sorcier d'Angmar", isCorrect: true },
                    { text: 'Saroumane', isCorrect: false },
                    { text: 'Sauron', isCorrect: false },
                    { text: 'Grima Langue de Serpent', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                text: 'Quel est le nom du dragon tué par Bard à Lacville ?',
                points: 10,
                choices: [
                    { text: 'Smaug', isCorrect: true },
                    { text: 'Glaurung', isCorrect: false },
                    { text: 'Ancalagon', isCorrect: false },
                    { text: 'Scatha', isCorrect: false },
                ],
            },
        ],
    },
    {
        title: 'Quiz Géographie de la Terre du Milieu',
        duration: 10,
        description: 'Explorez la carte de la Terre du Milieu.',
        visibility: true,
        questions: [
            {
                type: 'QCM',
                text: 'Quelle forêt est aussi appelée "Forêt Noire" ?',
                points: 10,
                choices: [
                    { text: 'La Vieille Forêt', isCorrect: false },
                    { text: 'Fangorn', isCorrect: false },
                    { text: 'La Forêt de Lothlórien', isCorrect: false },
                    { text: 'Mirkwood', isCorrect: true },
                ],
            },
            {
                type: 'QCM',
                text: 'Où vivent les Ents ?',
                points: 10,
                choices: [
                    { text: 'La Forêt de Fangorn', isCorrect: true },
                    { text: 'La Forêt Noire', isCorrect: false },
                    { text: 'La Comté', isCorrect: false },
                    { text: 'Les Montagnes Bleues', isCorrect: false },
                ],
            },
        ],
    },
    {
        title: 'Quiz de mathématique',
        duration: 10,
        description: 'Questions de mathématique du Cégép',
        visibility: true,
        questions: [
            {
                type: 'QCM',
                text: 'Que vaut Integer(cos(x))dx" ?',
                points: 50,
                choices: [
                    { text: 'sin(x) + C', isCorrect: true },
                    { text: '- sin(x) + C', isCorrect: false },
                    { text: '- cos(x) + C', isCorrect: false },
                    { text: 'log(x) + C', isCorrect: false },
                ],
            },
            {
                type: 'QRL',
                text: 'Combien y a-t-il de dizaines dans 10 000 ?',
                points: 10,
            },
        ],
    },
];
