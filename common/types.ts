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
    _id: string;
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
    _id: string;
    name: string;
    score: number;
    // If user is excluded from the game (cannot join again)
    isExcluded: boolean;
    // If user is currently active in the game (is still connected)
    isActive: boolean;
    answerState: AnswerState;
    role: GameRole;
    createdAt?: Date;
    updatedAt?: Date;
}

export enum QuestionType {
    QRL = 'QRL',
    QCM = 'QCM',
}

export interface Choice {
    _id: number;
    label: string;
    isCorrect: boolean;
}

export interface BaseQuestion {
    _id: string;
    label: string;
    points: number;
    createdAt: Date;
    lastModification: Date;
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
    _id: string;
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
    _id: string;
    name: string;
    description: string;
    duration: number;
    // Quiz is accessible to all users
    visibility: boolean;
    questions: Question[];
    createdAt: Date;
    lastModification: Date;
}

export interface Message {
    name: string;
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

export enum Variables {
    MinTime = 10,
    MaxTime = 60,
    MinScore = 10,
    MaxScore = 100,
    MaxCharacters = 200,
}

export interface QuestionFeedback {
    points: number;
    isCorrect: boolean;
    correctChoicesIndices: number[];
    incorrectSelectedChoicesIndices: number[];
    correctSelectedChoicesIndices: number[];
}
