import { QuizDto } from '@app/model/dto/quiz/quiz.dto';

export const mockQuizTable: QuizDto[] = [
    {
        name: 'Quiz Héros de la Terre du Milieu',
        duration: 10,
        description: 'Découvrez les héros emblématiques de la saga.',
        visibility: true,
        questions: [
            {
                type: 'QCM',
                label: 'Quel est le titre donné à Gandalf après sa résurrection ?',
                points: 10,
                choices: [
                    { label: 'Gandalf le Gris', isCorrect: false },
                    { label: 'Gandalf le Blanc', isCorrect: true },
                    { label: 'Gandalf le Noir', isCorrect: false },
                    { label: 'Gandalf le Rouge', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                label: 'Quelle est la race de Legolas ?',
                points: 10,
                choices: [
                    { label: 'Nain', isCorrect: false },
                    { label: 'Elfe', isCorrect: true },
                    { label: 'Homme', isCorrect: false },
                    { label: 'Hobbit', isCorrect: false },
                ],
            },
        ],
    },
    {
        name: 'Quiz Batailles Épiques',
        duration: 10,
        description: 'Testez vos connaissances sur les grandes batailles.',
        visibility: true,
        questions: [
            {
                type: 'QCM',
                label: 'Où se déroule la Bataille de la Porte Noire ?',
                points: 10,
                choices: [
                    { label: 'Gondor', isCorrect: false },
                    { label: 'Mordor', isCorrect: true },
                    { label: 'Rohan', isCorrect: false },
                    { label: 'Isengard', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                label: 'Qui commande les armées du Gondor lors de la Bataille des Champs du Pelennor ?',
                points: 10,
                choices: [
                    { label: 'Théoden', isCorrect: false },
                    { label: 'Aragorn', isCorrect: false },
                    { label: 'Denethor', isCorrect: false },
                    { label: 'Gandalf', isCorrect: true },
                ],
            },
        ],
    },
    {
        name: 'Quiz Artefacts Magiques',
        duration: 10,
        description: 'Connaissez-vous les objets magiques ?',
        visibility: true,
        questions: [
            {
                type: 'QCM',
                label: 'Quel anneau Bilbo trouve-t-il dans la grotte de Gollum ?',
                points: 10,
                choices: [
                    { label: "L'Anneau Unique", isCorrect: true },
                    { label: "L'Anneau de Pouvoir de Nenya", isCorrect: false },
                    { label: "L'Anneau de Barahir", isCorrect: false },
                    { label: "L'Anneau de Durin", isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                label: "Quel est l'objet qui permet à Frodon de se rendre invisible ?",
                points: 10,
                choices: [
                    { label: 'Le manteau elfique', isCorrect: false },
                    { label: "L'épée Sting", isCorrect: false },
                    { label: "L'Anneau Unique", isCorrect: true },
                    { label: "La lumière d'Eärendil", isCorrect: false },
                ],
            },
        ],
    },
    {
        name: 'Quiz Ennemis du Tiers Âge',
        duration: 10,
        description: 'Les forces obscures contre lesquelles les héros luttent.',
        visibility: true,
        questions: [
            {
                type: 'QCM',
                label: 'Qui est le chef des Nazgûl ?',
                points: 10,
                choices: [
                    { label: "Le Roi-Sorcier d'Angmar", isCorrect: true },
                    { label: 'Saroumane', isCorrect: false },
                    { label: 'Sauron', isCorrect: false },
                    { label: 'Grima Langue de Serpent', isCorrect: false },
                ],
            },
            {
                type: 'QCM',
                label: 'Quel est le nom du dragon tué par Bard à Lacville ?',
                points: 10,
                choices: [
                    { label: 'Smaug', isCorrect: true },
                    { label: 'Glaurung', isCorrect: false },
                    { label: 'Ancalagon', isCorrect: false },
                    { label: 'Scatha', isCorrect: false },
                ],
            },
        ],
    },
    {
        name: 'Quiz Géographie de la Terre du Milieu',
        duration: 10,
        description: 'Explorez la carte de la Terre du Milieu.',
        visibility: true,
        questions: [
            {
                type: 'QCM',
                label: 'Quelle forêt est aussi appelée "Forêt Noire" ?',
                points: 10,
                choices: [
                    { label: 'La Vieille Forêt', isCorrect: false },
                    { label: 'Fangorn', isCorrect: false },
                    { label: 'La Forêt de Lothlórien', isCorrect: false },
                    { label: 'Mirkwood', isCorrect: true },
                ],
            },
            {
                type: 'QCM',
                label: 'Où vivent les Ents ?',
                points: 10,
                choices: [
                    { label: 'La Forêt de Fangorn', isCorrect: true },
                    { label: 'La Forêt Noire', isCorrect: false },
                    { label: 'La Comté', isCorrect: false },
                    { label: 'Les Montagnes Bleues', isCorrect: false },
                ],
            },
        ],
    },
];
