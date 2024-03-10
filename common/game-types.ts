import { GameRole, GameState, GameType, Question } from './types';

export enum GameEvents {
    // Events launched by the client
    SelectAnswer = 'selectAnswer', // Event sent to the server when a player selects an answer
    ConfirmAnswers = 'confirmAnswers', // Event sent to the server when a player confirms his answers
    JoinGame = 'joinGame', // Event sent to the server when a player joins a game
    CreateGame = 'createGame', // Event sent to the server when a player creates a game
    Disconnect = 'disconnect', // Event sent to the server when a player disconnects
    StartGame = 'startGame', // Event sent to the server when an organizer starts a game
    NextQuestion = 'nextQuestion', // Event sent to the server when an organizer wants to pass to the next
    ChangeLockedState = 'changeLockedState', // Event sent to the server when an organizer wants to change the lock state
    BanPlayer = 'banPlayer', // Event sent to the server when an organizer wants to ban a player
    ToggleTimer = 'toggleTimer', // Event sent to the server when an organizer wants to toggle the timer
    SpeedUpTimer = 'speedUpTimer', // Event sent to the server when an organizer wants to speed up the timer
    SendMessage = 'sendMessage', // Event sent to the server when a user sends a chat message

    // Events launched by the server
    PlayerSelectAnswer = 'playerSelectedAnswer', // Event sent to organizer a player has selected an answer
    PlayerConfirmAnswers = 'playerConfirmedAnswers', // Event sent to organizer a player has confirmed his answers
    PlayerQuitGame = 'playerQuitGame', // Event sent to all players when a player quits the game
    PlayerJoinGame = 'playerJoinGame', // Event sent to all players when a new player joins the game
    PlayerConfirmJoinGame = 'playerConfirmJoinGame', // Event to confirm that the player has joined the game
    GameCooldown = 'gameCooldown', // Event sent to all players containing the remaining time of the cooldown
    GameClosed = 'gameClosed', // Event sent to all players when the game is closed
    GameStateChanged = 'gameStateChanged', // Event sent to all players when the game state is started
    GameLockedStateChanged = 'gameLockedStateChanged', // Event sent to all players when the game lock state is changed
    GameQuestion = 'gameQuestion', // Event sent to all players when a new question is asked
    AllPlayersAnswered = 'allPlayersAnswered', // Event sent to the organizer when all players have answered the question
    UpdateScore = 'updateScore', // Event sent to all players when the score is updated
    PlayerBanned = 'playerBanned', // Event sent to all players when a player is banned
    SendPlayersScores = 'sendPlayersScores', // Event sent to organizer all players scores
    PlayerHasGiveUp = 'playerHasGiveUp', // Event sent to organizer when a player has give up
    PlayerSendMessage = 'playerSendMessage', // Event broadcasted to room containing player
}

// Différents types définis

export type Answer = string | number[];
export type ExtendedAnswer = { hasInterracted: boolean; hasConfirmed: boolean; answer: Answer };
export type PlayerClient = { name: string; role: GameRole; score: number; isExcluded: boolean; hasGiveUp: boolean; answers?: ExtendedAnswer };
export type Client = { name: string; role: GameRole; score: number };
export type GameRestricted = { code: string; quizName: string; type: GameType }
export type SocketResponse = { isSuccess: boolean, message?: string };

export namespace GameEventsData {
    export interface SelectAnswer {
        answers: Answer;
    }

    export interface JoinGame {
        code: string;
        name: string;
    }

    export interface PlayerConfirmGame {
        code: string;
        isSuccess: boolean;
        message: string;
    }

    export interface CreateGame {
        code: string;
        quizId: string;
        gameType: GameType;
    }

    export interface PlayerConfirmAnswers {
        name: string;
    }

    export interface PlayerJoinGame {
        name: string;
        role: GameRole;
        score: number;
        isExcluded: boolean;
        hasGiveUp: boolean;
    }

    export interface PlayerQuitGame {
        name: string;
    }

    export interface GameCooldown {
        cooldown: number;
    }

    export interface GameStateChanged {
        gameState: GameState;
    }

    export interface GameQuestion {
        question: Question;
    }

    export interface PlayerSelectAnswer {
        name: string;
        answer: Answer;
    }

    export interface UpdateScore {
        score: number;
        hasAnsweredFirst: boolean;
    }

    export interface PlayerConfirmJoinGame {
        code: string;
        isSuccess: boolean;
        message: string;
        players: PlayerClient[];
        game: GameRestricted;
    }

    export interface GameLockedStateChanged {
        isLocked: boolean;
    }

    export interface PlayerBanned {
        name: string;
    }

    export interface BanPlayer {
        name: string;
    }

    export interface SendPlayersScores {
        scores: { name: string; score: number }[];
    }

    export interface PlayerHasGiveUp {
        name: string;
    }

    export interface SendMessage {
        content: string;
    }

    export interface PlayerSendMessage {
        name: string;
        content: string;
        createdAt: Date;
    }
}
