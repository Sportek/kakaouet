export enum AnswerState {
    Waiting = 'waiting',
    Interacted = 'interacted',
    Confirmed = 'confirmed',
}

export enum GameType {
    Default = 'default',
    Random = 'random',
    Test = 'test',
}

export interface Game {
    id: string;
    users: GameUser[];
    quiz: Quiz;
    type: GameType;
    // Players still can join the game
    isLocked: boolean;
    code: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

export enum GameRole {
    Organisator = 'organisator',
    Player = 'player',
}

export interface GameUser {
    id: string;
    name: string;
    score: number;
    // If user is excluded from the game (cannot join again)
    isExcluded: boolean;
    // If user is currently active in the game (is still connected)
    isActive: boolean;
    answerState: AnswerState;
    role: GameRole;
}

export enum QuestionType {
    QRL = 'qrl',
    QCM = 'qcm',
}

export interface Choice {
    id: number;
    label: string;
    isCorrect: boolean;
}

export interface BaseQuestion {
    id: string;
    label: string;
    points: number;
    createdAt: Date;
    updatedAt: Date;
}

export type Question =
    | ({
        type: QuestionType.QCM;
        choices: Choice[];
    } & BaseQuestion)
    | ({
        type: QuestionType.QRL;
    } & BaseQuestion);

export interface BaseUserResponse {
    id: string;
    gameUserId: string;
    createdAt: Date;
    updatedAt: Date;
}
export type UserResponse =
    | ({
        type: QuestionType.QCM;
        choicesId: string[];
    } & BaseUserResponse)
    | {
        type: QuestionType.QRL;
        answer: string;
    };

export interface Quiz {
    id: string;
    name: string;
    description: string;
    duration: number;
    // Quiz is accessible to all users
    visibility: boolean;
    questions: Question[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Message {
    gameUserId: string;
    content: string;
    createdAt: Date;
}

export enum GameState {
    // 1 En attente de joueurs pour commencer le quiz
    WaitingPlayers = 'waitingPlayers',

    // 2 Phase de réponse aux questions par les joueurs
    PlayersAnswerQuestion = 'playersAnswerQuestion',

    // 3 Phase de correction des réponses
    OrganisatorCorrectingAnswers = 'organisatorCorrectAnswers',

    // 4 Afficher les résultats de la question
    DisplayQuestionResults = 'displayQuestionResults',
    // Boucle les étapes 2 à 4 jusqu'à la fin du quiz

    // 5 Afficher les résultats du quiz, qui a gagné, etc.
    DisplayQuizResults = 'displayQuizResults',

    // 6 Le quiz est terminé
    End = 'end',
}
