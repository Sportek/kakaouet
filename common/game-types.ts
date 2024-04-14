import { Choice, GameRole, GameState, GameType, Question } from './types';

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
    MutePlayer = 'mutePlayer',
    RateAnswerQRL = 'rateAnswerQRL', // Event sent to the server when an organisator rate QRL answers of players

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
    PlayerSendResults = 'playerSendResults', // Event sent to all players when the results are sent
    SendCorrectAnswers = 'playerSendCorrectAnswers', // Event sent to all players containing the correct answers
    PlayerMuted = 'playerMuted',
    GameSpeedUpTimer = 'gameSpeedUpTimer', // Event sent to all players when the timer is speed up
    GameRoleChange = 'gameRoleChange', // Event sent to all players when the game is started with organisator role change
}

// Différents types définis
export type Answer = string | number[];

export interface ExtendedAnswer {
    hasInterracted: boolean;
    hasConfirmed: boolean;
    answer: Answer;
}
export interface PlayerClient {
    name: string;
    role: GameRole;
    score: number;
    isExcluded: boolean;
    hasGiveUp: boolean;
    answers?: ExtendedAnswer;
    isMuted: boolean;
    interactionStatus: InteractionStatus;
}
export enum InteractionStatus {
    noInteraction = 'noInteraction',
    interacted = 'interacted',
    finalized = 'finalized',
    abandoned = 'abandoned',
}

export enum SortingCriteria {
    name = 'name',
    score = 'score',
    status = 'status',
}



export interface Client {
    name: string;
    role: GameRole;
    score: number;
}
export interface GameRestricted {
    code: string;
    quizName: string;
    type: GameType;
}
export interface SocketResponse {
    isSuccess: boolean;
    message?: string;
}
export interface ActualQuestion {
    question: Question;
    totalQuestion: number;
    actualIndex: number;
}
export interface ChoiceData {
    text: string;
    amount: number;
    isCorrect: boolean;
}
export interface PlayerAnswers {
    [questionId: number]: CompletePlayerAnswer;
}
export interface CompletePlayerAnswer {
    hasInterracted: boolean;
    hasConfirmed: boolean;
    hasConfirmedAt?: Date;
    answer: string | number[];
}
export enum SoundType {
    TimerSpeedUp = 'assets/sounds/speed-up.wav',
    PlayingRoom = 'assets/sounds/lobby.mp3',
}

export interface Score {
    name: string;
    score: number;
    bonus: number;
}

export namespace GameEventsData {
    export interface RateAnswerQRL {
        playerName: string;
        score: number;
    }

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
        isMuted: boolean;
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
        actualQuestion: ActualQuestion;
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

    export interface PlayerMuted {
        name: string;
        isMuted: boolean;
    }

    export interface MutePlayer {
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

    export interface PlayerSendResults {
        scores: { name: string; score: number; bonus: number }[];
        choices: ChoiceData[][];
        questions: Question[];
    }

    export interface SendCorrectAnswers {
        choices: Choice[];
    }
}
export { GameState, GameType };
