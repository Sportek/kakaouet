import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { Timer } from '@app/classes/timer';
import { FIRST_PLAYER_SCORE_MULTIPLICATOR } from '@common/constants';
import { GameEvents } from '@common/game-types';
import { GameState, QuestionType, Quiz } from '@common/types';

const START_GAME_DELAY = 5;
const NEXT_QUESTION_DELAY = 3;

export class GameSession {
    code: string;
    quiz: Quiz;
    room: Room;
    timer: Timer;
    gameState: GameState;
    gameQuestionIndex: number;
    isLocked: boolean;

    constructor(code: string, room: Room, quiz: Quiz) {
        this.gameState = GameState.WaitingPlayers;
        this.gameQuestionIndex = 0;
        this.code = code;
        this.room = room;
        this.quiz = quiz;
        this.isLocked = false;
        this.room.setGame(this);
    }

    startGame(): void {
        if (this.gameState !== GameState.WaitingPlayers) return;
        this.timer = new Timer(START_GAME_DELAY, {
            whenDone: () => {
                this.changeGameState(GameState.PlayersAnswerQuestion);
                this.room.broadcast(GameEvents.GameQuestion, {}, { question: this.quiz.questions[this.gameQuestionIndex] });
                this.startQuestionCooldown();
            },
            whenIncrement: (timeLeft) => {
                this.room.broadcast(GameEvents.GameCooldown, {}, { cooldown: timeLeft });
            },
        });

        this.timer.start();
    }

    startQuestionCooldown(): void {
        if (this.gameState !== GameState.PlayersAnswerQuestion) return;

        this.timer = new Timer(this.quiz.duration, {
            whenDone: () => {
                this.displayQuestionResults();
            },
            whenIncrement: (timeLeft) => {
                this.room.broadcast(GameEvents.GameCooldown, {}, { cooldown: timeLeft });
            },
        });

        this.timer.start();
    }

    displayQuestionResults(): void {
        this.changeGameState(GameState.DisplayQuestionResults);
        this.calculateScores().forEach(({ player, hasAnsweredFirst }) => {
            player.send(GameEvents.UpdateScore, { score: player.score, hasAnsweredFirst });
        });
        const scores = this.room.getOnlyGamePlayers().map((player) => ({ name: player.name, score: player.score }));
        this.room.sendToOrganizer(GameEvents.SendPlayersScores, { scores });
    }

    nextQuestion(): void {
        if (this.gameState !== GameState.DisplayQuestionResults) return;

        this.gameQuestionIndex++;
        if (this.gameQuestionIndex >= this.quiz.questions.length) return this.displayResults();

        this.timer = new Timer(NEXT_QUESTION_DELAY, {
            whenDone: () => {
                this.changeGameState(GameState.PlayersAnswerQuestion);
                this.room.broadcast(GameEvents.GameQuestion, {}, { question: this.quiz.questions[this.gameQuestionIndex] });
                this.startQuestionCooldown();
            },
            whenIncrement: (timeLeft) => {
                this.room.broadcast(GameEvents.GameCooldown, {}, { cooldown: timeLeft });
            },
        });

        this.timer.start();
    }

    displayResults(): void {
        this.changeGameState(GameState.DisplayQuizResults);
    }

    endGame(): void {
        this.changeGameState(GameState.End);
        // TODO: Fermer les différentes connections à la room, delete, sauvegarde, etc.
    }

    changeGameState(gameState: GameState): void {
        this.gameState = gameState;
        this.room.broadcast(GameEvents.GameStateChanged, {}, { gameState: this.gameState });
    }

    changeGameLockState(): void {
        this.isLocked = !this.isLocked;
        this.room.broadcast(GameEvents.GameLockedStateChanged, {}, { isLocked: this.isLocked });
    }

    toggleTimer(): void {
        if (this.timer) this.timer.togglePlayPause();
    }

    speedUpTimer(): void {
        if (this.timer) this.timer.speedUp();
    }

    private calculateScores(): { player: Player; hasAnsweredFirst: boolean }[] {
        const question = this.quiz.questions[this.gameQuestionIndex];

        // TODO: Je ne gère pas les autres types de questions pour l'instant
        if (question.type !== QuestionType.QCM) return this.room.players.map((player) => ({ player, hasAnsweredFirst: false }));

        const correctAnswers = question.choices.flatMap((choice, index) => (choice.isCorrect ? index : []));
        let firstPlayerToAnswerTime: Date | null = null;
        const firstPlayersToAnswer = new Set<Player>();

        this.room.getOnlyGamePlayers().forEach((player) => {
            const answer = player.getAnswer(this.gameQuestionIndex);
            if (answer && this.isCorrectAnswer(answer.answer as number[], correctAnswers)) {
                player.score += question.points;
                if (!firstPlayerToAnswerTime || answer.hasConfirmedAt < firstPlayerToAnswerTime) {
                    firstPlayersToAnswer.clear();
                    firstPlayerToAnswerTime = answer.hasConfirmedAt;
                    firstPlayersToAnswer.add(player);
                }
                if (firstPlayerToAnswerTime && answer.hasConfirmedAt.getTime() === firstPlayerToAnswerTime.getTime()) {
                    firstPlayersToAnswer.add(player);
                }
            }
        });

        if (firstPlayersToAnswer.size !== 1) firstPlayersToAnswer.clear();

        return this.room.players.map((player) => {
            const hasAnsweredFirst = firstPlayersToAnswer.has(player);
            if (hasAnsweredFirst) player.score += question.points * FIRST_PLAYER_SCORE_MULTIPLICATOR;
            return { player, hasAnsweredFirst };
        });
    }

    private isCorrectAnswer(answer: number[], correctAnswers: number[]): boolean {
        return answer.every((index) => correctAnswers.includes(index));
    }
}
