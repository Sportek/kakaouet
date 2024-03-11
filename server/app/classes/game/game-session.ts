import { Player } from '@app/classes/player';
import { Room } from '@app/classes/room';
import { Timer } from '@app/classes/timer';
import { FIRST_PLAYER_SCORE_MULTIPLICATOR } from '@common/constants';
import { ActualQuestion, ChoiceData, GameEvents, GameEventsData } from '@common/game-types';
import { GameState, GameType, QuestionType, Quiz } from '@common/types';

const START_GAME_DELAY = 5;
const NEXT_QUESTION_DELAY = 3;

export class GameSession {
    code: string;
    quiz: Quiz;
    room: Room;
    timer: Timer;
    gameState: GameState;
    type: GameType;
    gameQuestionIndex: number;
    isLocked: boolean;

    // eslint-disable-next-line max-params -- Ici, on a besoin de tous ces paramètres
    constructor(code: string, room: Room, quiz: Quiz, gameType: GameType) {
        this.gameState = GameState.WaitingPlayers;
        this.gameQuestionIndex = 0;
        this.code = code;
        this.room = room;
        this.quiz = quiz;
        this.isLocked = false;
        this.room.setGame(this);
        this.type = gameType;
    }

    startGameDelayed(): void {
        if (this.gameState !== GameState.WaitingPlayers) return;
        if (this.type === GameType.Test) return this.startGame();

        this.simpleDelay(START_GAME_DELAY, () => {
            this.startGame();
        });
    }

    startGame() {
        this.changeGameState(GameState.PlayersAnswerQuestion);
        this.room.broadcast(
            GameEvents.GameQuestion,
            {},
            {
                actualQuestion: {
                    question: this.quiz.questions[this.gameQuestionIndex],
                    totalQuestion: this.quiz.questions.length,
                    actualIndex: this.gameQuestionIndex,
                } as ActualQuestion,
            },
        );
        this.startQuestionCooldown();
    }

    startQuestionCooldown(): void {
        if (this.gameState !== GameState.PlayersAnswerQuestion) return;
        this.simpleDelay(this.quiz.duration, () => {
            this.displayQuestionResults();
        });
    }

    displayQuestionResults(): void {
        this.changeGameState(GameState.DisplayQuestionResults);
        this.calculateScores().forEach(({ player, hasAnsweredFirst }) => {
            player.send(GameEvents.UpdateScore, { score: player.score, hasAnsweredFirst });
        });
        const scores = this.room.getOnlyGamePlayers().map((player) => ({ name: player.name, score: player.score }));
        this.room.sendToOrganizer(GameEvents.SendPlayersScores, { scores });
        if (this.type === GameType.Test) this.nextQuestion();
    }

    nextQuestion(): void {
        if (this.gameState !== GameState.DisplayQuestionResults) return;

        this.gameQuestionIndex++;
        if (this.gameQuestionIndex >= this.quiz.questions.length) return this.displayResults();
        this.simpleDelay(NEXT_QUESTION_DELAY, () => {
            this.changeGameState(GameState.PlayersAnswerQuestion);
            this.room.broadcast(
                GameEvents.GameQuestion,
                {},
                {
                    actualQuestion: {
                        question: this.quiz.questions[this.gameQuestionIndex],
                        actualIndex: this.gameQuestionIndex,
                        totalQuestion: this.quiz.questions.length,
                    } as ActualQuestion,
                },
            );
            this.startQuestionCooldown();
        });
    }

    displayResults(): void {
        this.simpleDelay(NEXT_QUESTION_DELAY, () => {
            this.changeGameState(GameState.DisplayQuizResults);
            this.sendResultsToPlayers();
        });
    }

    sendResultsToPlayers(): void {
        if (this.gameState !== GameState.DisplayQuizResults) return;

        const scores = this.room.getOnlyGamePlayers().map((player) => ({
            name: player.name,
            score: player.score,
            bonus: player.bonus,
        }));

        const choices: ChoiceData[][] = [];

        this.quiz.questions.forEach((question, index) => {
            if (question.type !== QuestionType.QCM) return;

            const globalPlayerAnswers = this.getAmountOfPlayersWhoAnswered(index);

            const choiceData: ChoiceData[] = question.choices.flatMap((choice, i) => {
                const amount = globalPlayerAnswers[i];
                const name = choice.label;
                const isCorrect = choice.isCorrect;
                return { label: name, amount, isCorrect };
            });

            choices.push(choiceData);
        });

        this.room.broadcast(GameEvents.PlayerSendResults, {}, {
            scores,
            choices,
            questions: this.quiz.questions,
        } as GameEventsData.PlayerSendResults);
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

    broadcastMessage(player: Player, content: string): void {
        const newDate: Date = new Date();
        this.room.broadcast(GameEvents.PlayerSendMessage, {}, { name: player.name, content, createdAt: newDate });
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
            if (hasAnsweredFirst) {
                player.score += question.points * FIRST_PLAYER_SCORE_MULTIPLICATOR;
                player.bonus++;
            }
            return { player, hasAnsweredFirst };
        });
    }

    private simpleDelay(delay: number, callback: () => void) {
        this.timer = new Timer(delay, {
            whenDone: callback,
            whenIncrement: (timeLeft) => {
                this.room.broadcast(GameEvents.GameCooldown, {}, { cooldown: timeLeft });
            },
        });
        this.timer.start();
    }

    private isCorrectAnswer(answer: number[], correctAnswers: number[]): boolean {
        return answer.every((index) => correctAnswers.includes(index));
    }

    private getAmountOfPlayersWhoAnswered(index: number): number[] {
        return this.room.getOnlyGamePlayers().reduce(
            (acc, player) => {
                const answer = player.getAnswer(index);
                if (!answer) return acc;
                const answers = answer.answer as number[];
                answers.forEach((i) => {
                    acc[i]++;
                });
                return acc;
            },
            [0, 0, 0, 0],
        );
    }
}
