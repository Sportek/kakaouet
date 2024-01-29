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

interface BaseQuestion {
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

interface BaseUserResponse {
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
